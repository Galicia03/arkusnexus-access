"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  User,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Calendar,
  Download,
  Camera,
  Settings,
  Bell,
  MapPin,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface PerfilUsuario {
  id: string
  nombre: string
  email: string
  departamento: string
  estado: "activo" | "inactivo"
  fechaRegistro: Date
  ultimoAcceso?: Date
  nivelAcceso: "basico" | "intermedio" | "avanzado"
  fotoRegistrada: boolean
}

interface RegistroAcceso {
  id: string
  timestamp: Date
  estado: "concedido" | "denegado"
  ubicacion: string
  confianza?: number
  dispositivo: string
  motivo?: string
}

interface EstadisticasPersonales {
  accesosEsteMes: number
  accesosExitosos: number
  intentosFallidos: number
  horaPromedio: string
  diasTrabajados: number
}

export default function DashboardColaborador() {
  const router = useRouter()
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario | null>(null)
  const [historialAccesos, setHistorialAccesos] = useState<RegistroAcceso[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasPersonales>({
    accesosEsteMes: 0,
    accesosExitosos: 0,
    intentosFallidos: 0,
    horaPromedio: "09:15",
    diasTrabajados: 0,
  })
  const [filtroFecha, setFiltroFecha] = useState("7") // últimos 7 días

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem("colaboradorToken")
    const usuarioId = localStorage.getItem("usuarioId")
    const nombreUsuario = localStorage.getItem("nombreUsuario")

    if (!token || !usuarioId) {
      router.push("/colaborador/login")
      return
    }

    // Datos mock basados en el usuarioId
    const usuarios = {
      "1": {
        id: "1",
        nombre: "Ana García Martínez",
        email: "ana.garcia@empresa.com",
        departamento: "Recursos Humanos",
        estado: "activo" as const,
        fechaRegistro: new Date("2024-01-15"),
        ultimoAcceso: new Date("2024-01-20T09:30:00"),
        nivelAcceso: "avanzado" as const,
        fotoRegistrada: true,
      },
      "2": {
        id: "2",
        nombre: "Carlos López Ruiz",
        email: "carlos.lopez@empresa.com",
        departamento: "Ingeniería",
        estado: "activo" as const,
        fechaRegistro: new Date("2024-01-10"),
        ultimoAcceso: new Date("2024-01-20T08:45:00"),
        nivelAcceso: "intermedio" as const,
        fotoRegistrada: true,
      },
      "3": {
        id: "3",
        nombre: "María Rodríguez Silva",
        email: "maria.rodriguez@empresa.com",
        departamento: "Marketing",
        estado: "activo" as const,
        fechaRegistro: new Date("2024-01-05"),
        ultimoAcceso: new Date("2024-01-19T17:20:00"),
        nivelAcceso: "basico" as const,
        fotoRegistrada: false,
      },
      "4": {
        id: "4",
        nombre: "José Fernández Torres",
        email: "jose.fernandez@empresa.com",
        departamento: "Ventas",
        estado: "inactivo" as const,
        fechaRegistro: new Date("2024-01-01"),
        nivelAcceso: "basico" as const,
        fotoRegistrada: true,
      },
    }

    const usuario = usuarios[usuarioId as keyof typeof usuarios]
    if (usuario) {
      setPerfilUsuario(usuario)

      // Historial mock personalizado por usuario
      const historialesMock = {
        "1": [
          {
            id: "1",
            timestamp: new Date("2024-01-20T09:30:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.96,
            dispositivo: "Terminal-001",
          },
          {
            id: "2",
            timestamp: new Date("2024-01-19T09:15:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.94,
            dispositivo: "Terminal-001",
          },
          {
            id: "3",
            timestamp: new Date("2024-01-19T17:45:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.92,
            dispositivo: "Terminal-001",
          },
          {
            id: "4",
            timestamp: new Date("2024-01-18T09:20:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Lateral",
            confianza: 0.89,
            dispositivo: "Terminal-002",
          },
          {
            id: "5",
            timestamp: new Date("2024-01-18T17:30:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.95,
            dispositivo: "Terminal-001",
          },
        ],
        "2": [
          {
            id: "1",
            timestamp: new Date("2024-01-20T08:45:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.93,
            dispositivo: "Terminal-001",
          },
          {
            id: "2",
            timestamp: new Date("2024-01-19T08:30:00"),
            estado: "denegado" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.42,
            dispositivo: "Terminal-001",
            motivo: "Calidad de imagen insuficiente",
          },
          {
            id: "3",
            timestamp: new Date("2024-01-19T08:32:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.91,
            dispositivo: "Terminal-001",
          },
        ],
        "3": [
          {
            id: "1",
            timestamp: new Date("2024-01-19T17:20:00"),
            estado: "concedido" as const,
            ubicacion: "Entrada Lateral",
            confianza: 0.89,
            dispositivo: "Terminal-002",
          },
          {
            id: "2",
            timestamp: new Date("2024-01-18T09:10:00"),
            estado: "denegado" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.38,
            dispositivo: "Terminal-001",
            motivo: "Foto de perfil no registrada",
          },
        ],
        "4": [
          {
            id: "1",
            timestamp: new Date("2024-01-15T10:00:00"),
            estado: "denegado" as const,
            ubicacion: "Entrada Principal",
            confianza: 0.25,
            dispositivo: "Terminal-001",
            motivo: "Usuario inactivo",
          },
        ],
      }

      const historial = historialesMock[usuarioId as keyof typeof historialesMock] || []
      setHistorialAccesos(historial)

      // Calcular estadísticas
      const accesosExitosos = historial.filter((h) => h.estado === "concedido").length
      const intentosFallidos = historial.filter((h) => h.estado === "denegado").length

      setEstadisticas({
        accesosEsteMes: historial.length,
        accesosExitosos,
        intentosFallidos,
        horaPromedio: "09:15",
        diasTrabajados: new Set(historial.map((h) => h.timestamp.toDateString())).size,
      })
    }
  }, [router])

  const cerrarSesion = () => {
    localStorage.removeItem("colaboradorToken")
    localStorage.removeItem("usuarioId")
    localStorage.removeItem("nombreUsuario")
    router.push("/")
  }

  const exportarHistorialAccesos = () => {
    if (!perfilUsuario) return

    const csvContent = [
      ["Fecha y Hora", "Estado", "Ubicación", "Confianza", "Dispositivo", "Motivo"],
      ...historialAccesos.map((registro) => [
        registro.timestamp.toLocaleString("es-ES"),
        registro.estado,
        registro.ubicacion,
        registro.confianza?.toString() || "",
        registro.dispositivo,
        registro.motivo || "",
      ]),
    ]
      .map((fila) => fila.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${perfilUsuario.nombre.replace(/\s+/g, "_")}_historial_accesos.csv`
    a.click()
  }

  const filtrarHistorialPorFecha = () => {
    const dias = Number.parseInt(filtroFecha)
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - dias)

    return historialAccesos.filter((registro) => registro.timestamp >= fechaLimite)
  }

  if (!perfilUsuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const historialFiltrado = filtrarHistorialPorFecha()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {perfilUsuario.nombre.split(" ")[0]}</h1>
                <p className="text-sm text-gray-600">{perfilUsuario.departamento}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={perfilUsuario.estado === "activo" ? "default" : "secondary"}>
                {perfilUsuario.estado}
              </Badge>
              <Button onClick={cerrarSesion} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Accesos Este Mes</p>
                  <p className="text-3xl font-bold">{estadisticas.accesosEsteMes}</p>
                </div>
                <Activity className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Accesos Exitosos</p>
                  <p className="text-3xl font-bold">{estadisticas.accesosExitosos}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Intentos Fallidos</p>
                  <p className="text-3xl font-bold">{estadisticas.intentosFallidos}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Días Trabajados</p>
                  <p className="text-3xl font-bold">{estadisticas.diasTrabajados}</p>
                </div>
                <Calendar className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="historial" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Historial de Accesos
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Mi Perfil */}
          <TabsContent value="perfil">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                      <p className="text-lg font-medium">{perfilUsuario.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estado</Label>
                      <Badge variant={perfilUsuario.estado === "activo" ? "default" : "secondary"} className="mt-1">
                        {perfilUsuario.estado}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Correo Electrónico</Label>
                      <p className="text-lg">{perfilUsuario.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Departamento</Label>
                      <p className="text-lg">{perfilUsuario.departamento}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nivel de Acceso</Label>
                      <Badge variant="outline" className="mt-1">
                        {perfilUsuario.nivelAcceso}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Registro</Label>
                      <p className="text-lg">{perfilUsuario.fechaRegistro.toLocaleDateString("es-ES")}</p>
                    </div>
                  </div>

                  {perfilUsuario.ultimoAcceso && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-medium text-gray-600">Último Acceso</Label>
                      <p className="text-lg">{perfilUsuario.ultimoAcceso.toLocaleString("es-ES")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Estado Biométrico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${perfilUsuario.fotoRegistrada ? "bg-green-100" : "bg-yellow-100"}`}
                      >
                        <Camera
                          className={`h-5 w-5 ${perfilUsuario.fotoRegistrada ? "text-green-600" : "text-yellow-600"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">Foto Facial</p>
                        <p className="text-sm text-gray-600">
                          {perfilUsuario.fotoRegistrada ? "Registrada y verificada" : "Pendiente de registro"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={perfilUsuario.fotoRegistrada ? "default" : "secondary"}>
                      {perfilUsuario.fotoRegistrada ? "Activa" : "Pendiente"}
                    </Badge>
                  </div>

                  {!perfilUsuario.fotoRegistrada && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bell className="h-4 w-4 text-yellow-600" />
                        <p className="font-medium text-yellow-800">Acción Requerida</p>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        Su foto facial no está registrada. Contacte al administrador para completar el registro
                        biométrico.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        Solicitar Registro
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precisión del Sistema:</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tiempo de Respuesta:</span>
                      <span className="font-medium">{"<"} 2 segundos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Última Actualización:</span>
                      <span className="font-medium">{perfilUsuario.fechaRegistro.toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historial de Accesos */}
          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Historial de Accesos
                    </CardTitle>
                    <CardDescription>Registro detallado de sus intentos de acceso</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="7">Últimos 7 días</option>
                      <option value="30">Últimos 30 días</option>
                      <option value="90">Últimos 3 meses</option>
                      <option value="365">Último año</option>
                    </select>
                    <Button onClick={exportarHistorialAccesos} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historialFiltrado.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay registros de acceso en el período seleccionado</p>
                    </div>
                  ) : (
                    historialFiltrado.map((registro) => (
                      <div
                        key={registro.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              registro.estado === "concedido" ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{registro.ubicacion}</p>
                              <p className="text-sm text-gray-600">{registro.dispositivo}</p>
                              {registro.motivo && <p className="text-sm text-red-600">{registro.motivo}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={registro.estado === "concedido" ? "default" : "destructive"}>
                            {registro.estado === "concedido" ? "Acceso Concedido" : "Acceso Denegado"}
                          </Badge>
                          <div className="text-right text-sm text-gray-500">
                            <p className="font-medium">{registro.timestamp.toLocaleDateString("es-ES")}</p>
                            <p>{registro.timestamp.toLocaleTimeString("es-ES")}</p>
                            {registro.confianza && (
                              <p className="text-xs">Confianza: {(registro.confianza * 100).toFixed(1)}%</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración */}
          <TabsContent value="configuracion">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones de Acceso</p>
                      <p className="text-sm text-gray-600">Recibir alertas por cada acceso exitoso</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alertas de Seguridad</p>
                      <p className="text-sm text-gray-600">Notificar intentos de acceso fallidos</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Resumen Semanal</p>
                      <p className="text-sm text-gray-600">Recibir resumen de actividad semanal</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Registrar Fotos para Reconocimiento
                  </Button>
                  <Button className="w-full" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Modificar Datos Personales
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Reportar Problema
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
