import { type NextRequest, NextResponse } from "next/server"
import { accessLogOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let logs
    if (user.role === "admin") {
      // Admin can see all logs
      logs = userId ? accessLogOperations.getByUserId(userId) : accessLogOperations.getRecent(limit)
    } else {
      // Collaborators can only see their own logs
      logs = accessLogOperations.getByUserId(user.id)
    }

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Get access logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
