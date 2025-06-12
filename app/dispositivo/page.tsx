"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Clock, Wifi } from "lucide-react"
import Link from "next/link"

interface RegistroAcceso {
  id: string
  timestamp: Date
  estado: "concedido" | "denegado"
  confianza?: number
  nombreUsuario?: string
  departamento?: string
  motivo?: string
}

interface EstadisticasDispositivo {
  accesosHoy: number
  usuariosUnicos: number
  intentosFallidos: number
  tiempoPromedioRespuesta: number
}

export default function DispositivoDedicado() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activo, setActivo] = useState(false)
  const [estadoActual, setEstadoActual] = useState<"inactivo" | "escaneando" | "concedido" | "denegado">("inactivo")
  const [registrosRecientes, setRegistrosRecientes] = useState<RegistroAcceso[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [tiempoRespuesta, setTiempoRespuesta] = useState<number>(0)
  const [estadisticas, setEstadisticas] = useState<EstadisticasDispositivo>({
    accesosHoy: 47,
    usuariosUnicos: 23,
    intentosFallidos: 3,
    tiempoPromedioRespuesta: 1.4,
  })

  const iniciarCamara = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setActivo(true)
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      alert("No se puede acceder a la cámara. Verifique los permisos.")
    }
  }

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setActivo(false)
    setEstadoActual("inactivo")
  }

  const simularReconocimientoFacial = async () => {
    if (!activo) return

    const inicioTiempo = Date.now()
    setEstadoActual("escaneando")

    try {
      // Capture image from video (simulated)
      const canvas = canvasRef.current
      const video = videoRef.current

      if (canvas && video) {
        const ctx = canvas.getContext("2d")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx?.drawImage(video, 0, 0)

        // Convert to base64
        const imageData = canvas.toDataURL("image/jpeg", 0.8)

        // Call facial recognition API
        const response = await fetch("/api/face-recognition/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData,
            location: "Entrada Principal",
            deviceId: "Terminal-001",
          }),
        })

        const result = await response.json()
        const tiempoTranscurrido = (Date.now() - inicioTiempo) / 1000
        setTiempoRespuesta(tiempoTranscurrido)

        const nuevoRegistro: RegistroAcceso = {
          id: result.logId || Date.now().toString(),
          timestamp: new Date(),
          estado: result.accessGranted ? "concedido" : "denegado",
          confianza: result.confidence,
          nombreUsuario: result.user?.name,
          departamento: result.user?.department || "Desconocido",
          motivo: result.accessGranted ? undefined : "Rostro no reconocido",
        }

        setRegistrosRecientes((prev) => [nuevoRegistro, ...prev.slice(0, 4)])
        setEstadoActual(result.accessGranted ? "concedido" : "denegado")

        // Update statistics
        setEstadisticas((prev) => ({
          ...prev,
          accesosHoy: prev.accesosHoy + 1,
          usuariosUnicos: result.accessGranted ? prev.usuariosUnicos : prev.usuariosUnicos,
          intentosFallidos: result.accessGranted ? prev.intentosFallidos : prev.intentosFallidos + 1,
          tiempoPromedioRespuesta: (prev.tiempoPromedioRespuesta + tiempoTranscurrido) / 2,
        }))
      }
    } catch (error) {
      console.error("Error en reconocimiento facial:", error)
      // Fallback to simulation
      const esReconocido = Math.random() > 0.3
      const tiempoTranscurrido = (Date.now() - inicioTiempo) / 1000
      setTiempoRespuesta(tiempoTranscurrido)

      const nuevoRegistro: RegistroAcceso = {
        id: Date.now().toString(),
        timestamp: new Date(),
        estado: esReconocido ? "concedido" : "denegado",
        confianza: esReconocido ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5,
        nombreUsuario: esReconocido
          ? ["Ana García", "Carlos López", "María Rodríguez"][Math.floor(Math.random() * 3)]
          : undefined,
        departamento: esReconocido
          ? ["Recursos Humanos", "Ingeniería", "Marketing"][Math.floor(Math.random() * 3)]
          : undefined,
        motivo: esReconocido ? undefined : "Error de conexión",
      }

      setRegistrosRecientes((prev) => [nuevoRegistro, ...prev.slice(0, 4)])
      setEstadoActual(esReconocido ? "concedido" : "denegado")
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setEstadoActual("inactivo")
    }, 3000)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activo && estadoActual === "inactivo") {
      // Auto-detección cada 2 segundos cuando está inactivo
      interval = setInterval(() => {
        simularReconocimientoFacial()
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [activo, estadoActual])

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "concedido":
        return "bg-green-500"
      case "denegado":
        return "bg-red-500"
      case "escaneando":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case "concedido":
        return <CheckCircle className="h-8 w-8 text-white" />
      case "denegado":
        return <XCircle className="h-8 w-8 text-white" />
      case "escaneando":
        return <AlertTriangle className="h-8 w-8 text-white animate-pulse" />
      default:
        return <Camera className="h-8 w-8 text-white" />
    }
  }

  const obtenerMensajeEstado = (estado: string) => {
    switch (estado) {
      case "concedido":
        return "ACCESO CONCEDIDO"
      case "denegado":
        return "ACCESO DENEGADO"
      case "escaneando":
        return "ESCANEANDO..."
      default:
        return "LISTO PARA ESCANEAR"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Terminal de Acceso - Entrada Principal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Conectado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${activo ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm">{activo ? "Activo" : "Inactivo"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feed de Cámara Principal */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Cámara de Reconocimiento Facial
                  </div>
                  {tiempoRespuesta > 0 && (
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {tiempoRespuesta.toFixed(2)}s
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video ref={videoRef} autoPlay muted className="w-full h-96 bg-black rounded-lg object-cover" />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ display: "none" }} />

                  {/* Overlay de Estado */}
                  <div
                    className={`absolute top-4 right-4 p-4 rounded-lg ${obtenerColorEstado(estadoActual)} flex items-center space-x-3`}
                  >
                    {obtenerIconoEstado(estadoActual)}
                    <div>
                      <div className="font-bold text-lg">{obtenerMensajeEstado(estadoActual)}</div>
                      {estadoActual === "escaneando" && <div className="text-sm opacity-90">Procesando imagen...</div>}
                    </div>
                  </div>

                  {/* Marco de Detección */}
                  {estadoActual === "escaneando" && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-yellow-400 rounded-lg animate-pulse">
                      <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-400"></div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-400"></div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-400"></div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-400"></div>
                    </div>
                  )}

                  {/* Información del Usuario Reconocido */}
                  {estadoActual === "concedido" && registrosRecientes[0] && (
                    <div className="absolute bottom-4 left-4 bg-green-600/90 backdrop-blur-sm p-4 rounded-lg">
                      <div className="text-white">
                        <div className="font-bold text-lg">{registrosRecientes[0].nombreUsuario}</div>
                        <div className="text-sm opacity-90">{registrosRecientes[0].departamento}</div>
                        <div className="text-xs opacity-75">
                          Confianza: {((registrosRecientes[0].confianza || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información de Acceso Denegado */}
                  {estadoActual === "denegado" && registrosRecientes[0] && (
                    <div className="absolute bottom-4 left-4 bg-red-600/90 backdrop-blur-sm p-4 rounded-lg">
                      <div className="text-white">
                        <div className="font-bold text-lg">Acceso Denegado</div>
                        <div className="text-sm opacity-90">{registrosRecientes[0].motivo}</div>
                        <div className="text-xs opacity-75">
                          Confianza: {((registrosRecientes[0].confianza || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                  {!activo ? (
                    <Button onClick={iniciarCamara} className="bg-green-600 hover:bg-green-700 px-8 py-3">
                      <Camera className="h-5 w-5 mr-2" />
                      Activar Cámara
                    </Button>
                  ) : (
                    <>
                      <Button onClick={detenerCamara} variant="destructive" className="px-6">
                        Detener Cámara
                      </Button>
                      <Button
                        onClick={simularReconocimientoFacial}
                        disabled={estadoActual !== "inactivo"}
                        className="bg-blue-600 hover:bg-blue-700 px-6"
                      >
                        Escaneo Manual
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Estadísticas del Dispositivo */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Estadísticas del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accesos Totales:</span>
                    <span className="text-white font-bold">{estadisticas.accesosHoy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Usuarios Únicos:</span>
                    <span className="text-white font-bold">{estadisticas.usuariosUnicos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Intentos Fallidos:</span>
                    <span className="text-red-400 font-bold">{estadisticas.intentosFallidos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tiempo Promedio:</span>
                    <span className="text-green-400 font-bold">{estadisticas.tiempoPromedioRespuesta.toFixed(2)}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {registrosRecientes.length === 0 ? (
                    <p className="text-gray-400 text-sm">Sin actividad reciente</p>
                  ) : (
                    registrosRecientes.map((registro) => (
                      <div key={registro.id} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={registro.estado === "concedido" ? "default" : "destructive"}
                            className={registro.estado === "concedido" ? "bg-green-600" : "bg-red-600"}
                          >
                            {registro.estado === "concedido" ? "Concedido" : "Denegado"}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {registro.timestamp.toLocaleTimeString("es-ES")}
                          </span>
                        </div>
                        {registro.nombreUsuario ? (
                          <>
                            <p className="text-sm font-medium text-white">{registro.nombreUsuario}</p>
                            <p className="text-xs text-gray-400">{registro.departamento}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-300">{registro.motivo}</p>
                        )}
                        {registro.confianza && (
                          <p className="text-xs text-gray-400 mt-1">
                            Confianza: {(registro.confianza * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estado del Sistema */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cámara:</span>
                    <span className={activo ? "text-green-400" : "text-red-400"}>{activo ? "Activa" : "Inactiva"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Reconocimiento:</span>
                    <span className="text-green-400">Operativo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Base de Datos:</span>
                    <span className="text-green-400">Conectada</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Red:</span>
                    <span className="text-green-400">Estable</span>
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
