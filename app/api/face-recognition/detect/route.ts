import { type NextRequest, NextResponse } from "next/server"
import { accessLogOperations, userOperations } from "@/lib/database"
import { facialRecognitionService } from "@/lib/facial-recognition"

export async function POST(request: NextRequest) {
  try {
    const { imageData, location = "Entrada Principal", deviceId = "Terminal-001" } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    // Extract face descriptor from image
    const faceDescriptor = await facialRecognitionService.extractFaceDescriptor(imageData)

    if (!faceDescriptor) {
      return NextResponse.json({ error: "No face detected in image" }, { status: 400 })
    }

    // Attempt to recognize the face
    const recognitionResult = await facialRecognitionService.recognizeFace(faceDescriptor)

    // Create access log
    const accessLog = accessLogOperations.create({
      userId: recognitionResult.userId,
      userName: recognitionResult.userName,
      timestamp: new Date(),
      status: recognitionResult.recognized ? "granted" : "denied",
      location,
      confidence: recognitionResult.confidence,
      faceImage: imageData,
    })

    if (recognitionResult.recognized) {
      // Access granted
      return NextResponse.json({
        success: true,
        recognized: true,
        user: {
          id: recognitionResult.userId,
          name: recognitionResult.userName,
        },
        confidence: recognitionResult.confidence,
        accessGranted: true,
        logId: accessLog.id,
        provider: recognitionResult.provider,
      })
    } else {
      // Face not recognized - handle with grouping
      const unrecognizedFaceId = await facialRecognitionService.handleUnrecognizedFace(
        imageData,
        faceDescriptor,
        location,
        deviceId,
      )

      // Get admin email from database
      const adminUser = userOperations.getAll().find((user) => user.role === "admin")
      const adminEmail = adminUser?.email || "nohemiagalicia@gmail.com"

      // Format current time
      const currentTime = new Date().toLocaleString("es-ES")

      // Send notification to administrators via email (simulated in v0)
      try {
        const emailResponse = await fetch(new URL("/api/notifications/email", request.url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: "🚨 Alerta de Seguridad - Rostro No Reconocido",
            message: `Se ha detectado un rostro no reconocido en el sistema de control de acceso.
            
📍 Ubicación: ${location}
🕐 Fecha y Hora: ${currentTime}
🖥️ Dispositivo: ${deviceId}
            
Por favor, revise la imagen adjunta y tome las medidas necesarias.
            
Puede gestionar este incidente desde el panel administrativo.`,
            recipientEmail: adminEmail,
            imageData: imageData,
          }),
        })

        const emailResult = await emailResponse.json()
        console.log("Email notification result:", emailResult)
      } catch (emailError) {
        console.error("Email notification error:", emailError)
        // Continue even if email fails
      }

      return NextResponse.json({
        success: true,
        recognized: false,
        confidence: recognitionResult.confidence,
        accessGranted: false,
        logId: accessLog.id,
        unrecognizedFaceId,
        provider: recognitionResult.provider,
        emailNotificationSent: true,
      })
    }
  } catch (error) {
    console.error("Face detection error:", error)
    return NextResponse.json({ error: "Face detection failed" }, { status: 500 })
  }
}
