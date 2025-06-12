import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  email: string
  role: "admin" | "collaborator"
  name: string
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User
    return decoded
  } catch (error) {
    return null
  }
}

export function hashPassword(password: string): string {
  // In a real application, use bcrypt or similar
  return Buffer.from(password).toString("base64")
}

export function comparePassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString("base64") === hash
}
