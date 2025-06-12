import { type NextRequest, NextResponse } from "next/server"
import { facialRecognitionService } from "@/lib/facial-recognition"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const unrecognizedFaces = facialRecognitionService.getUnrecognizedFaces()
    const faceGroups = facialRecognitionService.getFaceGroups()

    // Group faces for easier management
    const groupedFaces = Array.from(faceGroups.entries()).map(([groupId, faces]) => ({
      groupId,
      faces: faces.map((face) => ({
        id: face.id,
        imageData: face.imageData,
        timestamp: face.timestamp,
        location: face.location,
        deviceId: face.deviceId,
        attempts: face.attempts,
        confidence: face.faceDescriptor.confidence,
      })),
      totalAttempts: faces.reduce((sum, face) => sum + face.attempts, 0),
      lastSeen: new Date(Math.max(...faces.map((f) => f.timestamp.getTime()))),
      locations: [...new Set(faces.map((f) => f.location))],
    }))

    // Individual faces not in groups
    const individualFaces = unrecognizedFaces
      .filter((face) => !face.grouped)
      .map((face) => ({
        id: face.id,
        imageData: face.imageData,
        timestamp: face.timestamp,
        location: face.location,
        deviceId: face.deviceId,
        attempts: face.attempts,
        confidence: face.faceDescriptor.confidence,
      }))

    return NextResponse.json({
      groupedFaces,
      individualFaces,
      totalUnrecognized: unrecognizedFaces.length,
      totalGroups: faceGroups.size,
    })
  } catch (error) {
    console.error("Get unrecognized faces error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
