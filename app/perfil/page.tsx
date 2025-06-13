'use client';

import { useState } from 'react';
import FaceCaptureModal from '@/components/FaceCaptureModal';

export default function PerfilPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSaveDescriptor = (descriptor: Float32Array) => {
    console.log("Descriptor obtenido:", Array.from(descriptor));
    // Aquí luego se guardará en Firestore
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Registrar rostro</h1>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Registrar rostro
      </button>

      <FaceCaptureModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCapture={handleSaveDescriptor}
      />
    </div>
  );
}
