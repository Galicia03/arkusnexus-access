"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Users,
  Activity,
  Bell,
  Plus,
  Download,
  Search,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  Settings,
  BarChart3,
  Camera,
  Clock,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Usuario {
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
  usuarioId?: string
  nombreUsuario?: string
  timestamp: Date
  estado: "concedido" | "denegado"
  ubicacion: string
  confianza?: number
  dispositivo: string
}

interface Notificacion {
  id: string
  tipo: "acceso_no_autorizado" | "alerta_sistema" | "registro_usuario" | "mantenimiento"
  mensaje: string
  timestamp: Date
  leida: boolean
  prioridad: "alta" | "media" | "baja"
}

interface Estadisticas {
  usuariosTotales: number
  accesosHoy: number
  accesosExitosos: number
  intentosFallidos: number
  disponibilidadSistema: number
  tiempoPromedioRespuesta: number
}

export default function DashboardAdministrador() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: "1",
      nombre: "Ana García Martínez",
      email: "ana.garcia@empresa.com",
      departamento: "Recursos Humanos",
      estado: "activo",
      fechaRegistro: new Date("2024-01-15"),
      ultimoAcceso: new Date("2024-01-20T09:30:00"),
      nivelAcceso: "avanzado",
      fotoRegistrada: true,
    },
    {
      id: "2",
      nombre: "Carlos López Ruiz",
      email: "carlos.lopez@empresa.com",
      departamento: "Ingeniería",
      estado: "activo",
      fechaRegistro: new Date("2024-01-10"),
      ultimoAcceso: new Date("2024-01-20T08:45:00"),
      nivelAcceso: "intermedio",
      fotoRegistrada: true,
    },
    {
      id: "3",
      nombre: "María Rodríguez Silva",
      email: "maria.rodriguez@empresa.com",
      departamento: "Marketing",
      estado: "activo",
      fechaRegistro: new Date("2024-01-05"),
      ultimoAcceso: new Date("2024-01-19T17:20:00"),
      nivelAcceso: "basico",
      fotoRegistrada: false,
    },
    {
      id: "4",
      nombre: "José Fernández Torres",
      email: "jose.fernandez@empresa.com",
      departamento: "Ventas",
      estado: "inactivo",
      fechaRegistro: new Date("2024-01-01"),
      nivelAcceso: "basico",
      fotoRegistrada: true,
    },
  ])

  const [registrosAcceso, setRegistrosAcceso] = useState<RegistroAcceso[]>([
    {
      id: "1",
      usuarioId: "1",
      nombreUsuario: "Ana García Martínez",
      timestamp: new Date("2024-01-20T09:30:00"),
      estado: "concedido",
      ubicacion: "Entrada Principal",
      confianza: 0.96,
      dispositivo: "Terminal-001",
    },
    {
      id: "2",
      usuarioId: "2",
      nombreUsuario: "Carlos López Ruiz",
      timestamp: new Date("2024-01-20T08:45:00"),
      estado: "concedido",
      ubicacion: "Entrada Principal",
      confianza: 0.94,
      dispositivo: "Terminal-001",
    },
    {
      id: "3",
      timestamp: new Date("2024-01-20T07:15:00"),
      estado: "denegado",
      ubicacion: "Entrada Principal",
      confianza: 0.35,
      dispositivo: "Terminal-001",
    },
    {
      id: "4",
      usuarioId: "3",
      nombreUsuario: "María Rodríguez Silva",
      timestamp: new Date("2024-01-19T17:20:00"),
      estado: "concedido",
      ubicacion: "Entrada Lateral",
      confianza: 0.89,
      dispositivo: "Terminal-002",
    },
  ])

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: "1",
      tipo: "acceso_no_autorizado",
      mensaje: "Rostro no reconocido detectado en Entrada Principal",
      timestamp: new Date("2024-01-20T07:15:00"),
      leida: false,
      prioridad: "alta",
    },
    {
      id: "2",
      tipo: "registro_usuario",
      mensaje: "Nuevo usuario registrado: María Rodríguez Silva",
      timestamp: new Date("2024-01-19T14:30:00"),
      leida: true,
      prioridad: "media",
    },
    {
      id: "3",
      tipo: "mantenimiento",
      mensaje: "Mantenimiento programado del sistema para esta noche",
      timestamp: new Date("2024-01-18T16:00:00"),
      leida: true,
      prioridad: "baja",
    },
  ])

  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    usuariosTotales: 4,
    accesosHoy: 15,
    accesosExitosos: 12,
    intentosFallidos: 3,
    disponibilidadSistema: 99.9,
    tiempoPromedioRespuesta: 1.4,
  })

  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>("todos")
  const [activeTab, setActiveTab] = useState<string>("usuarios")

  // Formulario para nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    departamento: "",
    nivelAcceso: "basico" as "basico" | "intermedio" | "avanzado",
  })

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
    }

    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(() => {
      setEstadisticas((prev) => ({
        ...prev,
        accesosHoy: prev.accesosHoy + Math.floor(Math.random() * 2),
        tiempoPromedioRespuesta: Math.random() * 0.5 + 1.0,
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const cerrarSesion = () => {
    localStorage.removeItem("adminToken")
    router.push("/")
  }

  const marcarNotificacionComoLeida = (id: string) => {
    setNotificaciones((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif)))
  }

  const exportarHistorialAccesos = () => {
    const csvContent = [
      ["Fecha y Hora", "Usuario", "Estado", "Ubicación", "Confianza", "Dispositivo"],
      ...registrosAcceso.map((registro) => [
        registro.timestamp.toLocaleString("es-ES"),
        registro.nombreUsuario || "Usuario no identificado",
        registro.estado,
        registro.ubicacion,
        registro.confianza?.toString() || "",
        registro.dispositivo,
      ]),
    ]
      .map((fila) => fila.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `historial-accesos-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const agregarUsuario = () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.departamento) {
      alert("Por favor complete todos los campos")
      return
    }

    const usuario: Usuario = {
      id: Date.now().toString(),
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      departamento: nuevoUsuario.departamento,
      estado: "activo",
      fechaRegistro: new Date(),
      nivelAcceso: nuevoUsuario.nivelAcceso,
      fotoRegistrada: false,
    }

    setUsuarios((prev) => [...prev, usuario])
    setNuevoUsuario({ nombre: "", email: "", departamento: "", nivelAcceso: "basico" })

    // Agregar notificación
    const nuevaNotificacion: Notificacion = {
      id: Date.now().toString(),
      tipo: "registro_usuario",
      mensaje: `Nuevo usuario registrado: ${usuario.nombre}`,
      timestamp: new Date(),
      leida: false,
      prioridad: "media",
    }
    setNotificaciones((prev) => [nuevaNotificacion, ...prev])
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideTermino =
      usuario.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.departamento.toLowerCase().includes(terminoBusqueda.toLowerCase())

    const coincideEstado = filtroEstado === "todos" || usuario.estado === filtroEstado
    const coincideDepartamento = filtroDepartamento === "todos" || usuario.departamento === filtroDepartamento

    return coincideTermino && coincideEstado && coincideDepartamento
  })

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length
  const departamentos = [...new Set(usuarios.map((u) => u.departamento))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
                <p className="text-sm text-gray-600">Sistema de Control de Acceso Biométrico</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative" onClick={() => setActiveTab("notificaciones")}>
                  <Bell className="h-5 w-5" />
                  {notificacionesNoLeidas > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 animate-pulse">
                      {notificacionesNoLeidas}
                    </Badge>
                  )}
                </Button>
                {notificacionesNoLeidas > 0 && (
                  <div className="absolute top-full right-0 mt-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 text-xs text-red-700 whitespace-nowrap">
                    ¡Nuevas alertas de seguridad!
                  </div>
                )}
              </div>
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
                  <p className="text-blue-100">Usuarios Totales</p>
                  <p className="text-3xl font-bold">{estadisticas.usuariosTotales}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Accesos Hoy</p>
                  <p className="text-3xl font-bold">{estadisticas.accesosHoy}</p>
                </div>
                <Activity className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Disponibilidad</p>
                  <p className="text-3xl font-bold">{estadisticas.disponibilidadSistema}%</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Tiempo Respuesta</p>
                  <p className="text-3xl font-bold">{estadisticas.tiempoPromedioRespuesta.toFixed(1)}s</p>
                </div>
                <Clock className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="usuarios" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Gestión de Usuarios
            </TabsTrigger>
            <TabsTrigger value="accesos" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Historial de Accesos
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="reportes" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="rostros" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Rostros No Reconocidos
            </TabsTrigger>
          </TabsList>

          {/* Gestión de Usuarios */}
          <TabsContent value="usuarios" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Lista de Usuarios */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Usuarios Registrados</CardTitle>
                        <CardDescription>Gestione los colaboradores y sus permisos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center space-x-2 flex-1 min-w-64">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar usuarios..."
                          value={terminoBusqueda}
                          onChange={(e) => setTerminoBusqueda(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="activo">Activos</SelectItem>
                          <SelectItem value="inactivo">Inactivos</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {departamentos.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      {usuariosFiltrados.map((usuario) => (
                        <div
                          key={usuario.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-lg">
                                {usuario.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{usuario.nombre}</p>
                              <p className="text-sm text-gray-600">{usuario.email}</p>
                              <p className="text-sm text-gray-500">{usuario.departamento}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <Badge variant={usuario.estado === "activo" ? "default" : "secondary"}>
                                {usuario.estado}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">{usuario.nivelAcceso}</div>
                            </div>
                            <div className="text-center">
                              {usuario.fotoRegistrada ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <Camera className="h-5 w-5 text-gray-400 mx-auto" />
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {usuario.fotoRegistrada ? "Registrada" : "Pendiente"}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Registro: {usuario.fechaRegistro.toLocaleDateString("es-ES")}</p>
                              {usuario.ultimoAcceso && (
                                <p>Último acceso: {usuario.ultimoAcceso.toLocaleDateString("es-ES")}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulario Nuevo Usuario */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Registrar Nuevo Usuario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        value={nuevoUsuario.nombre}
                        onChange={(e) => setNuevoUsuario((prev) => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre y apellidos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={nuevoUsuario.email}
                        onChange={(e) => setNuevoUsuario((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="usuario@empresa.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        value={nuevoUsuario.departamento}
                        onChange={(e) => setNuevoUsuario((prev) => ({ ...prev, departamento: e.target.value }))}
                        placeholder="Ej: Recursos Humanos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nivelAcceso">Nivel de Acceso</Label>
                      <Select
                        value={nuevoUsuario.nivelAcceso}
                        onValueChange={(value: "basico" | "intermedio" | "avanzado") =>
                          setNuevoUsuario((prev) => ({ ...prev, nivelAcceso: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basico">Básico</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={agregarUsuario} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Usuario
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Historial de Accesos */}
          <TabsContent value="accesos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Historial de Accesos</CardTitle>
                    <CardDescription>Registro completo de intentos de acceso al sistema</CardDescription>
                  </div>
                  <Button onClick={exportarHistorialAccesos} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrosAcceso.map((registro) => (
                    <div key={registro.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            registro.estado === "concedido" ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">{registro.nombreUsuario || "Usuario no identificado"}</p>
                          <p className="text-sm text-gray-600">
                            {registro.ubicacion} - {registro.dispositivo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={registro.estado === "concedido" ? "default" : "destructive"}>
                          {registro.estado === "concedido" ? "Acceso Concedido" : "Acceso Denegado"}
                        </Badge>
                        <div className="text-right text-sm text-gray-500">
                          <p>{registro.timestamp.toLocaleString("es-ES")}</p>
                          {registro.confianza && <p>Confianza: {(registro.confianza * 100).toFixed(1)}%</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificaciones */}
          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones del Sistema</CardTitle>
                <CardDescription>Alertas de seguridad y actualizaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        notificacion.leida ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                      }`}
                      onClick={() => marcarNotificacionComoLeida(notificacion.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              notificacion.tipo === "acceso_no_autorizado"
                                ? "bg-red-100"
                                : notificacion.tipo === "alerta_sistema"
                                  ? "bg-yellow-100"
                                  : notificacion.tipo === "registro_usuario"
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                            }`}
                          >
                            {notificacion.tipo === "acceso_no_autorizado" && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {notificacion.tipo === "alerta_sistema" && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            {notificacion.tipo === "registro_usuario" && <UserPlus className="h-4 w-4 text-blue-600" />}
                            {notificacion.tipo === "mantenimiento" && <Settings className="h-4 w-4 text-gray-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{notificacion.mensaje}</p>
                            <p className="text-sm text-gray-500">{notificacion.timestamp.toLocaleString("es-ES")}</p>
                            <Badge
                              variant="outline"
                              className={`mt-2 ${
                                notificacion.prioridad === "alta"
                                  ? "border-red-200 text-red-700"
                                  : notificacion.prioridad === "media"
                                    ? "border-yellow-200 text-yellow-700"
                                    : "border-gray-200 text-gray-700"
                              }`}
                            >
                              Prioridad {notificacion.prioridad}
                            </Badge>
                          </div>
                        </div>
                        {!notificacion.leida && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reportes */}
          <TabsContent value="reportes">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Acceso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">Accesos Exitosos</span>
                      <span className="text-2xl font-bold text-green-600">{estadisticas.accesosExitosos}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-red-800">Intentos Fallidos</span>
                      <span className="text-2xl font-bold text-red-600">{estadisticas.intentosFallidos}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800">Tasa de Éxito</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {((estadisticas.accesosExitosos / estadisticas.accesosHoy) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800">Disponibilidad</span>
                      <span className="text-2xl font-bold text-purple-600">{estadisticas.disponibilidadSistema}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-800">Tiempo Promedio</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {estadisticas.tiempoPromedioRespuesta.toFixed(2)}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">Usuarios Activos</span>
                      <span className="text-2xl font-bold text-gray-600">
                        {usuarios.filter((u) => u.estado === "activo").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rostros No Reconocidos */}
          <TabsContent value="rostros">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Rostros</CardTitle>
                  <CardDescription>Administre rostros no reconocidos y asigne usuarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-red-800">Rostros Pendientes</p>
                        <p className="text-sm text-red-600">Requieren atención inmediata</p>
                      </div>
                      <Badge variant="destructive">5 pendientes</Badge>
                    </div>
                    <Link href="/admin/unrecognized-faces">
                      <Button className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Gestionar Rostros No Reconocidos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Reconocimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Umbral de Confianza:</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Proveedor de API:</span>
                      <Badge variant="outline">Azure Face API</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Agrupación Automática:</span>
                      <Badge variant="default">Habilitada</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar APIs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
