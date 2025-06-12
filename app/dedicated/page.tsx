"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AccessAttempt {
  id: string
  timestamp: Date
  status: "granted" | "denied"
  confidence?: number
  userName?: string
}

export default function DedicatedMode() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<"idle" | "scanning" | "granted" | "denied">("idle")
  const [recentAttempts, setRecentAttempts] = useState<AccessAttempt[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setIsActive(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsActive(false)
    setCurrentStatus("idle")
  }

  const simulateFaceDetection = () => {
    if (!isActive) return

    setCurrentStatus("scanning")

    // Simulate face detection and recognition
    setTimeout(() => {
      const isRecognized = Math.random() > 0.3 // 70% recognition rate for demo
      const newAttempt: AccessAttempt = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status: isRecognized ? "granted" : "denied",
        confidence: isRecognized ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5,
        userName: isRecognized ? ["John Doe", "Jane Smith", "Mike Johnson"][Math.floor(Math.random() * 3)] : undefined,
      }

      setRecentAttempts((prev) => [newAttempt, ...prev.slice(0, 4)])
      setCurrentStatus(isRecognized ? "granted" : "denied")

      // Reset status after 3 seconds
      setTimeout(() => {
        setCurrentStatus("idle")
      }, 3000)
    }, 2000)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && currentStatus === "idle") {
      interval = setInterval(() => {
        // Auto-detect faces every 3 seconds when idle
        simulateFaceDetection()
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isActive, currentStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "granted":
        return "bg-green-500"
      case "denied":
        return "bg-red-500"
      case "scanning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "granted":
        return <CheckCircle className="h-8 w-8 text-white" />
      case "denied":
        return <XCircle className="h-8 w-8 text-white" />
      case "scanning":
        return <AlertTriangle className="h-8 w-8 text-white animate-pulse" />
      default:
        return <Camera className="h-8 w-8 text-white" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Dedicated Access Control</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Camera Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video ref={videoRef} autoPlay muted className="w-full h-80 bg-black rounded-lg object-cover" />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ display: "none" }} />

                  {/* Status Overlay */}
                  <div
                    className={`absolute top-4 right-4 p-3 rounded-lg ${getStatusColor(currentStatus)} flex items-center space-x-2`}
                  >
                    {getStatusIcon(currentStatus)}
                    <span className="font-semibold capitalize">{currentStatus}</span>
                  </div>

                  {/* Face Detection Box (simulated) */}
                  {currentStatus === "scanning" && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-yellow-400 rounded-lg animate-pulse"></div>
                  )}
                </div>

                <div className="flex justify-center mt-4 space-x-4">
                  {!isActive ? (
                    <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCamera} variant="destructive">
                        Stop Camera
                      </Button>
                      <Button onClick={simulateFaceDetection} disabled={currentStatus !== "idle"}>
                        Manual Scan
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttempts.length === 0 ? (
                    <p className="text-gray-400 text-sm">No recent activity</p>
                  ) : (
                    recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={attempt.status === "granted" ? "default" : "destructive"}>
                            {attempt.status === "granted" ? "Access Granted" : "Access Denied"}
                          </Badge>
                          <span className="text-xs text-gray-400">{attempt.timestamp.toLocaleTimeString()}</span>
                        </div>
                        {attempt.userName && <p className="text-sm font-medium text-white">{attempt.userName}</p>}
                        {attempt.confidence && (
                          <p className="text-xs text-gray-400">Confidence: {(attempt.confidence * 100).toFixed(1)}%</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Camera Status:</span>
                    <span className={isActive ? "text-green-400" : "text-red-400"}>
                      {isActive ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recognition Engine:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database:</span>
                    <span className="text-green-400">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Attempts Today:</span>
                    <span className="text-white">{recentAttempts.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
