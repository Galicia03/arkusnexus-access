"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import FaceRegistrationModal from "@/components/FaceRegistrationModal"
import { useAuthState } from 'react-firebase-hooks/auth'
import { Camera } from "lucide-react";

export default function DashboardColaborador() {
  const router = useRouter()
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<{ nombre: string; email: string; rol: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [perfilNoEncontrado, setPerfilNoEncontrado] = useState(false)

  useEffect(() => {
    if (user === undefined) return // Espera a que el estado de autenticación se resuelva
    if (!user) {
      router.push("/colaborador/login")
      return
    }

    const obtenerDatosUsuario = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserData({
            nombre: data.displayName || "Sin nombre",
            email: data.email || "Sin correo",
            rol: data.role || "Sin rol",
          })
        } else {
          setUserData({ nombre: "Desconocido", email: "No encontrado", rol: "N/A" })
          setPerfilNoEncontrado(true)
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error)
      } finally {
        setIsLoading(false)
      }
    }

    obtenerDatosUsuario()
  }, [user, router])

  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Cargando información del usuario...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {perfilNoEncontrado && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          No se encontró un perfil registrado en la base de datos.
        </div>
      )}

      <h1 className="text-4xl font-bold mb-8 text-purple-800 text-center">Panel del Colaborador</h1>

      {/* Perfil */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Nombre</h2>
          <p className="text-gray-600">{userData?.nombre}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Correo Electrónico</h2>
          <p className="text-gray-600">{userData?.email}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Rol</h2>
          <p className="text-gray-600">{userData?.rol}</p>
        </div>
      </section>

      {/* Historial */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Historial de accesos</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-gray-600">(Aquí irá la tabla con historial de registros faciales o accesos en el futuro)</p>
        </div>
      </section>

      {/* Configuración */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Configuración</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 mb-4">Desde aquí puede registrar su rostro para el sistema de acceso.</p>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setShowModal(true)}
          >
            <Camera className="h-4 w-4 mr-2" />
            Registrar Fotos
          </Button>
        </div>
      </section>

      <FaceRegistrationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

