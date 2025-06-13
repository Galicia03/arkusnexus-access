'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

const FaceRegistrationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [descriptors, setDescriptors] = useState<Float32Array[]>([]);
  const [user] = useAuthState(auth);

  // Cargar modelos FaceAPI
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    };
    loadModels();
  }, []);

  // Iniciar cámara cuando el modal esté abierto
  useEffect(() => {
    if (isOpen && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Camera error:', err));
    }
  }, [isOpen]);

  // Dibujar detección en canvas en tiempo real
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const detectLive = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;

      faceapi.matchDimensions(canvas, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
      );

      const resized = faceapi.resizeResults(detections, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
    };

    if (isOpen) {
      intervalId = setInterval(detectLive, 500); // Detectar cada 0.5s
    }

    return () => clearInterval(intervalId);
  }, [isOpen]);

  // Capturar imagen y vector
  const captureImage = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');

    const detection = await faceapi
      .detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    console.log("Detección:", detection);

    if (detection && detection.descriptor) {
      setImages((prev) => [...prev, dataURL]);
      setDescriptors((prev) => [...prev, detection.descriptor]);
    } else {
      alert('No se detectó ningún rostro. Intenta de nuevo.');
    }
  };

  const handleSave = async () => {
    if (!user || descriptors.length < 3) return;

    const userRef = doc(db, 'faceDescriptors', user.uid);
    await setDoc(userRef, {
      descriptors: descriptors.map((d) => Array.from(d)),
      imagesCount: descriptors.length,
      createdAt: new Date().toISOString(),
    });

    alert('Rostros registrados correctamente.');
    onClose();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-full max-w-md space-y-4 relative">
        <h2 className="text-xl font-semibold">Registro Facial</h2>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-auto rounded border"
            width={480}
            height={360}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            width={480}
            height={360}
          />
        </div>
        <button onClick={captureImage} className="bg-blue-500 text-white px-4 py-2 rounded">
          Capturar Rostro
        </button>
        <p>Imágenes capturadas: {images.length}/3</p>
        <div className="flex gap-2">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`captura-${idx}`} className="w-16 h-16 object-cover rounded border" />
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handleSave} disabled={images.length < 3} className="bg-green-600 text-white px-4 py-2 rounded">
            Guardar
          </button>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-red-500">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default FaceRegistrationModal;
