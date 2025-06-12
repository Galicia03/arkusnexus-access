import { NextResponse } from "next/server"
import { notificationOperations } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { subject, message, recipientEmail, imageData } = await request.json()

    if (!recipientEmail || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For v0 preview environment, we'll simulate email sending
    // In production, you would use a service like Resend, SendGrid, or Nodemailer

    console.log("📧 Email Notification (Simulated):")
    console.log("To:", recipientEmail)
    console.log("Subject:", subject)
    console.log("Message:", message)
    console.log("Has Image:", !!imageData)

    // Create notification in the system
    const notification = notificationOperations.create({
      type: "unauthorized_access",
      message: `${subject}: ${message.substring(0, 100)}...`,
      timestamp: new Date(),
      read: false,
    })

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      notification: notification,
      simulated: true, // Indicates this was simulated for demo
    })
  } catch (error) {
    console.error("Email notification error:", error)
    return NextResponse.json({ error: "Failed to send email notification" }, { status: 500 })
  }
}
