"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Camera, Users, Activity, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [stats, setStats] = useState({
    usuariosActivos: 150,
    accesosHoy: 250,
    disponibilidad: 99.9,
    tiempoRespuesta: 1.2,
  })

  useEffect(() => {
    // Simular carga de estadísticas en tiempo real
    const interval = setInterval(() => {
      setStats((prev) => ({
        usuariosActivos: Math.floor(Math.random() * 50) + 150,
        accesosHoy: Math.floor(Math.random() * 100) + 250,
        disponibilidad: 99.9,
        tiempoRespuesta: Math.random() * 0.5 + 1.0,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SecureAccess Pro</h1>
                <p className="text-sm text-gray-600">Sistema de Control de Acceso Biométrico</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Sistema Activo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Control de Acceso
            <span className="block text-blue-600">Inteligente y Seguro</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sistema avanzado de reconocimiento facial con gestión integral de usuarios, reportes en tiempo real y máxima
            seguridad para su organización.
          </p>

          {/* Stats en tiempo real */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.usuariosActivos}</div>
              <div className="text-sm text-gray-600">Usuarios Activos</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.accesosHoy}</div>
              <div className="text-sm text-gray-600">Accesos Hoy</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{stats.disponibilidad}%</div>
              <div className="text-sm text-gray-600">Disponibilidad</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{stats.tiempoRespuesta.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Tiempo Respuesta</div>
            </div>
          </div>
        </div>

        {/* Selector de Roles */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Dispositivo Dedicado */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Camera className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Dispositivo Dedicado</CardTitle>
              <CardDescription className="text-gray-600">
                Terminal de acceso con reconocimiento facial automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Detección automática de rostros
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Respuesta en tiempo real {"<"} 2s
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Registro automático de accesos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Alertas de seguridad instantáneas
                </div>
              </div>
              <Link href="/dispositivo" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  <Camera className="h-5 w-5 mr-2" />
                  Activar Terminal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Panel Administrativo */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Panel Administrativo</CardTitle>
              <CardDescription className="text-gray-600">Gestión completa del sistema y usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                  Gestión de usuarios y permisos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                  Reportes y estadísticas avanzadas
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                  Configuración del sistema
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                  Alertas y notificaciones
                </div>
              </div>
              <Link href="/admin/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <Shield className="h-5 w-5 mr-2" />
                  Acceso Administrativo
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Portal del Colaborador */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <User className="h-12 w-12 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Portal del Colaborador</CardTitle>
              <CardDescription className="text-gray-600">Acceso personal a historial y configuración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                  Historial personal de accesos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                  Registro de asistencias
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                  Actualización de datos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                  Solicitudes y notificaciones
                </div>
              </div>
              <Link href="/colaborador/login" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3">
                  <User className="h-5 w-5 mr-2" />
                  Portal Personal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Características del Sistema */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Características Principales</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tiempo Real</h4>
              <p className="text-sm text-gray-600">Reconocimiento facial en menos de 2 segundos</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Alta Precisión</h4>
              <p className="text-sm text-gray-600">Tasa de falsos positivos {"<"} 0.1%</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestión Integral</h4>
              <p className="text-sm text-gray-600">Control completo de usuarios y permisos</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Disponibilidad</h4>
              <p className="text-sm text-gray-600">Sistema disponible 99.9% del tiempo</p>
            </div>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Estado del Sistema</h3>
              <p className="text-gray-600">Todos los servicios funcionando correctamente</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-semibold">Operativo</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Cámaras</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Base de Datos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Reconocimiento</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Notificaciones</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SecureAccess Pro. Sistema de Control de Acceso Biométrico.</p>
            <p className="text-sm mt-2">Versión 2.0 - Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
