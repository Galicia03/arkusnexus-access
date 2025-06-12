import { type NextRequest, NextResponse } from "next/server"
import { userOperations } from "@/lib/database"
import { generateToken, comparePassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = userOperations.findByEmail(email)

    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    // Update last access
    userOperations.update(user.id, { lastAccess: new Date() })

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
