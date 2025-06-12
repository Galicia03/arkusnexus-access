"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Activity, Clock, CheckCircle, XCircle, LogOut, Calendar, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  department: string
  status: "active" | "inactive"
  registeredAt: Date
  lastAccess?: Date
}

interface AccessRecord {
  id: string
  timestamp: Date
  status: "granted" | "denied"
  location: string
  confidence?: number
}

export default function CollaboratorDashboard() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [accessHistory, setAccessHistory] = useState<AccessRecord[]>([])

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("collaboratorToken")
    const userId = localStorage.getItem("userId")

    if (!token || !userId) {
      router.push("/collaborator/login")
      return
    }

    // Mock user data based on userId
    const users = {
      "1": {
        id: "1",
        name: "John Doe",
        email: "john@company.com",
        department: "Engineering",
        status: "active" as const,
        registeredAt: new Date("2024-01-15"),
        lastAccess: new Date("2024-01-20T09:30:00"),
      },
      "2": {
        id: "2",
        name: "Jane Smith",
        email: "jane@company.com",
        department: "Marketing",
        status: "active" as const,
        registeredAt: new Date("2024-01-10"),
        lastAccess: new Date("2024-01-20T08:45:00"),
      },
      "3": {
        id: "3",
        name: "Mike Johnson",
        email: "mike@company.com",
        department: "Sales",
        status: "inactive" as const,
        registeredAt: new Date("2024-01-05"),
      },
    }

    const user = users[userId as keyof typeof users]
    if (user) {
      setUserProfile(user)

      // Mock access history for the user
      const mockHistory: AccessRecord[] = [
        {
          id: "1",
          timestamp: new Date("2024-01-20T09:30:00"),
          status: "granted",
          location: "Main Entrance",
          confidence: 0.95,
        },
        {
          id: "2",
          timestamp: new Date("2024-01-19T17:45:00"),
          status: "granted",
          location: "Main Entrance",
          confidence: 0.92,
        },
        {
          id: "3",
          timestamp: new Date("2024-01-19T08:15:00"),
          status: "granted",
          location: "Main Entrance",
          confidence: 0.88,
        },
        {
          id: "4",
          timestamp: new Date("2024-01-18T09:00:00"),
          status: "denied",
          location: "Main Entrance",
          confidence: 0.45,
        },
        {
          id: "5",
          timestamp: new Date("2024-01-18T08:58:00"),
          status: "granted",
          location: "Main Entrance",
          confidence: 0.91,
        },
      ]
      setAccessHistory(mockHistory)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("collaboratorToken")
    localStorage.removeItem("userId")
    router.push("/")
  }

  const exportAccessHistory = () => {
    if (!userProfile) return

    const csvContent = [
      ["Timestamp", "Status", "Location", "Confidence"],
      ...accessHistory.map((record) => [
        record.timestamp.toISOString(),
        record.status,
        record.location,
        record.confidence?.toString() || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${userProfile.name.replace(" ", "_")}_access_history.csv`
    a.click()
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  const grantedAccess = accessHistory.filter((record) => record.status === "granted").length
  const deniedAccess = accessHistory.filter((record) => record.status === "denied").length
  const totalAccess = accessHistory.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {userProfile.name}</h1>
                <p className="text-sm text-gray-600">{userProfile.department} Department</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Name</p>
                  <p className="text-lg">{userProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Address</p>
                  <p className="text-lg">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="text-lg">{userProfile.department}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <Badge variant={userProfile.status === "active" ? "default" : "secondary"} className="mt-1">
                    {userProfile.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Registered Date</p>
                  <p className="text-lg">{userProfile.registeredAt.toLocaleDateString()}</p>
                </div>
                {userProfile.lastAccess && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Access</p>
                    <p className="text-lg">{userProfile.lastAccess.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Access Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAccess}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Successful Access</p>
                  <p className="text-2xl font-bold text-gray-900">{grantedAccess}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{deniedAccess}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Access History
                </CardTitle>
                <CardDescription>Your recent access attempts and results</CardDescription>
              </div>
              <Button onClick={exportAccessHistory} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${record.status === "granted" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{record.timestamp.toLocaleString()}</span>
                    </div>
                    <span className="text-gray-600">{record.location}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={record.status === "granted" ? "default" : "destructive"}>
                      {record.status === "granted" ? "Access Granted" : "Access Denied"}
                    </Badge>
                    {record.confidence && (
                      <span className="text-sm text-gray-500">{(record.confidence * 100).toFixed(1)}% confidence</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
