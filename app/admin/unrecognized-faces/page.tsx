"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Users, Clock, MapPin, UserPlus, CheckCircle, Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UnrecognizedFace {
  id: string
  imageData: string
  timestamp: Date
  location: string
  deviceId: string
  attempts: number
  confidence: number
}

interface FaceGroup {
  groupId: string
  faces: UnrecognizedFace[]
  totalAttempts: number
  lastSeen: Date
  locations: string[]
}

interface NewUserData {
  name: string
  email: string
  department: string
}

export default function UnrecognizedFacesPage() {
  const router = useRouter()
  const [groupedFaces, setGroupedFaces] = useState<FaceGroup[]>([])
  const [individualFaces, setIndividualFaces] = useState<UnrecognizedFace[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFace, setSelectedFace] = useState<UnrecognizedFace | null>(null)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [existingUsers, setExistingUsers] = useState<any[]>([])
  const [registrationMode, setRegistrationMode] = useState<"existing" | "new">("existing")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [newUserData, setNewUserData] = useState<NewUserData>({
    name: "",
    email: "",
    department: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    loadUnrecognizedFaces()
    loadExistingUsers()
  }, [router])

  const loadUnrecognizedFaces = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/unrecognized-faces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGroupedFaces(
          data.groupedFaces.map((group: any) => ({
            ...group,
            lastSeen: new Date(group.lastSeen),
            faces: group.faces.map((face: any) => ({
              ...face,
              timestamp: new Date(face.timestamp),
            })),
          })),
        )
        setIndividualFaces(
          data.individualFaces.map((face: any) => ({
            ...face,
            timestamp: new Date(face.timestamp),
          })),
        )
      }
    } catch (error) {
      console.error("Error loading unrecognized faces:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadExistingUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExistingUsers(data.users.filter((u: any) => u.role === "collaborator"))
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleRegisterFace = async () => {
    if (!selectedFace) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/register-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faceId: selectedFace.id,
          userId: registrationMode === "existing" ? selectedUserId : undefined,
          userData: registrationMode === "new" ? newUserData : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Rostro registrado exitosamente para ${data.user.name}`)
        setShowRegisterDialog(false)
        setSelectedFace(null)
        loadUnrecognizedFaces() // Reload data
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error registering face:", error)
      alert("Error al registrar el rostro")
    }
  }

  const openRegisterDialog = (face: UnrecognizedFace) => {
    setSelectedFace(face)
    setShowRegisterDialog(true)
    setRegistrationMode("existing")
    setSelectedUserId("")
    setNewUserData({ name: "", email: "", department: "" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rostros No Reconocidos</h1>
                <p className="text-sm text-gray-600">Gestione y registre rostros no identificados</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {groupedFaces.length + individualFaces.length} pendientes
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Grupos de Rostros</p>
                  <p className="text-2xl font-bold text-gray-900">{groupedFaces.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Camera className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rostros Individuales</p>
                  <p className="text-2xl font-bold text-gray-900">{individualFaces.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Intentos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groupedFaces.reduce((sum, group) => sum + group.totalAttempts, 0) + individualFaces.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grouped Faces */}
        {groupedFaces.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Rostros Agrupados
              </CardTitle>
              <CardDescription>Múltiples intentos de la misma persona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {groupedFaces.map((group) => (
                  <div key={group.groupId} className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={group.faces[0].imageData || "/placeholder.svg"}
                          alt="Rostro no reconocido"
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">Persona No Identificada</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Último intento: {group.lastSeen.toLocaleString("es-ES")}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {group.locations.join(", ")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="destructive">{group.totalAttempts} intentos</Badge>
                        <Button onClick={() => openRegisterDialog(group.faces[0])} size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Registrar
                        </Button>
                      </div>
                    </div>

                    {/* Show all faces in group */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {group.faces.slice(1, 6).map((face, index) => (
                        <div key={face.id} className="relative">
                          <img
                            src={face.imageData || "/placeholder.svg"}
                            alt={`Intento ${index + 2}`}
                            className="w-full h-16 rounded object-cover border border-gray-300"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b">
                            {face.timestamp.toLocaleTimeString("es-ES")}
                          </div>
                        </div>
                      ))}
                      {group.faces.length > 6 && (
                        <div className="w-full h-16 rounded border border-gray-300 flex items-center justify-center bg-gray-100 text-gray-600 text-sm">
                          +{group.faces.length - 6} más
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Faces */}
        {individualFaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Rostros Individuales
              </CardTitle>
              <CardDescription>Intentos únicos de acceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {individualFaces.map((face) => (
                  <div key={face.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={face.imageData || "/placeholder.svg"}
                        alt="Rostro no reconocido"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Intento Individual</h3>
                          <Badge variant="outline">{(face.confidence * 100).toFixed(1)}%</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {face.timestamp.toLocaleString("es-ES")}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {face.location}
                          </div>
                        </div>
                        <Button onClick={() => openRegisterDialog(face)} size="sm" className="mt-3 w-full">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Registrar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {groupedFaces.length === 0 && individualFaces.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Todo en orden!</h3>
              <p className="text-gray-600">No hay rostros no reconocidos pendientes de registro.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Register Face Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Rostro</DialogTitle>
            <DialogDescription>Asigne este rostro a un usuario existente o cree uno nuevo</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedFace && (
              <div className="flex justify-center">
                <img
                  src={selectedFace.imageData || "/placeholder.svg"}
                  alt="Rostro a registrar"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>Modo de Registro</Label>
              <Select
                value={registrationMode}
                onValueChange={(value: "existing" | "new") => setRegistrationMode(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Usuario Existente</SelectItem>
                  <SelectItem value="new">Crear Nuevo Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {registrationMode === "existing" ? (
              <div className="space-y-2">
                <Label>Seleccionar Usuario</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre y apellidos"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={newUserData.department}
                    onChange={(e) => setNewUserData((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Ej: Recursos Humanos"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleRegisterFace}
                className="flex-1"
                disabled={
                  registrationMode === "existing"
                    ? !selectedUserId
                    : !newUserData.name || !newUserData.email || !newUserData.department
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
