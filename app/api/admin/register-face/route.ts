import { type NextRequest, NextResponse } from "next/server"
import { facialRecognitionService } from "@/lib/facial-recognition"
import { userOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const { faceId, userId, userData } = await request.json()

    if (!faceId) {
      return NextResponse.json({ error: "Face ID is required" }, { status: 400 })
    }

    let targetUserId = userId

    // If no userId provided, create new user
    if (!targetUserId && userData) {
      const newUser = userOperations.create({
        name: userData.name,
        email: userData.email,
        password: Buffer.from("temp123").toString("base64"), // Temporary password
        department: userData.department,
        role: "collaborator",
        status: "active",
      })
      targetUserId = newUser.id
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID or user data is required" }, { status: 400 })
    }

    // Register the face to the user
    const success = await facialRecognitionService.registerFaceToUser(faceId, targetUserId)

    if (!success) {
      return NextResponse.json({ error: "Failed to register face" }, { status: 400 })
    }

    // Update user as having registered face
    userOperations.update(targetUserId, { faceData: "registered" })

    const updatedUser = userOperations.findById(targetUserId)

    return NextResponse.json({
      success: true,
      message: "Face registered successfully",
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        department: updatedUser?.department,
      },
    })
  } catch (error) {
    console.error("Register face error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
