"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function LoginColaborador() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCred.user.uid

      const userDocRef = doc(db, "users", uid)
      const userSnap = await getDoc(userDocRef)

      if (!userSnap.exists()) {
        alert("El usuario no tiene un perfil registrado en Firestore.")
        return
      }

      const userData = userSnap.data()

      if (userData.rol !== "colaborador") {
        alert("Este usuario no tiene permisos de colaborador.")
        return
      }

      localStorage.setItem("colaboradorToken", uid)
      localStorage.setItem("usuarioId", uid)
      localStorage.setItem("nombreUsuario", userData.nombre || "Colaborador")

      router.push("/colaborador/dashboard")
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      alert("Credenciales inválidas o error de red.")
    } finally {
      setCargando(false)
    }
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
              Acceda a su información personal y registro facial
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

            <div className="text-center mt-6 text-xs text-gray-500">
              Autenticación real con Firebase y control de acceso por rol
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
