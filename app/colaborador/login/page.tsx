"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginColaborador() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    // Simular autenticación
    setTimeout(() => {
      const usuariosValidos = [
        { email: "ana.garcia@empresa.com", password: "user123", id: "1", nombre: "Ana García Martínez" },
        { email: "carlos.lopez@empresa.com", password: "user123", id: "2", nombre: "Carlos López Ruiz" },
        { email: "maria.rodriguez@empresa.com", password: "user123", id: "3", nombre: "María Rodríguez Silva" },
        { email: "jose.fernandez@empresa.com", password: "user123", id: "4", nombre: "José Fernández Torres" },
      ]

      const usuario = usuariosValidos.find((u) => u.email === email && u.password === password)

      if (usuario) {
        localStorage.setItem("colaboradorToken", `user-jwt-token-${usuario.id}`)
        localStorage.setItem("usuarioId", usuario.id)
        localStorage.setItem("nombreUsuario", usuario.nombre)
        router.push("/colaborador/dashboard")
      } else {
        alert("Credenciales inválidas. Pruebe ana.garcia@empresa.com / user123")
      }
      setCargando(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="absolute top-4 left-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-purple-100 rounded-full">
                <User className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Portal del Colaborador</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Acceda a su información personal y historial de accesos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={manejarLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="su.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 focus:border-purple-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-300 focus:border-purple-500 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                  >
                    {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                disabled={cargando}
              >
                {cargando ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 font-medium mb-2">Credenciales de Demostración:</p>
              <div className="space-y-1 text-sm text-purple-700">
                <p>
                  <strong>Ana García:</strong> ana.garcia@empresa.com / user123
                </p>
                <p>
                  <strong>Carlos López:</strong> carlos.lopez@empresa.com / user123
                </p>
                <p>
                  <strong>María Rodríguez:</strong> maria.rodriguez@empresa.com / user123
                </p>
                <p>
                  <strong>José Fernández:</strong> jose.fernandez@empresa.com / user123
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">Acceso seguro con autenticación biométrica y cifrado de datos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
