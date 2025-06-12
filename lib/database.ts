// Mock database for demonstration
// In production, use a real database like Supabase, Neon, or PostgreSQL

export interface User {
  id: string
  name: string
  email: string
  password: string
  department: string
  role: "admin" | "collaborator"
  status: "active" | "inactive"
  faceData?: string // Base64 encoded face descriptor
  registeredAt: Date
  lastAccess?: Date
}

export interface AccessLog {
  id: string
  userId?: string
  userName?: string
  timestamp: Date
  status: "granted" | "denied"
  location: string
  confidence?: number
  faceImage?: string // Base64 encoded image
}

export interface Notification {
  id: string
  type: "unauthorized_access" | "system_alert" | "user_registration"
  message: string
  timestamp: Date
  read: boolean
  userId?: string
}

// Mock data store
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@company.com",
    password: "dXNlcjEyMw==", // user123 encoded
    department: "Engineering",
    role: "collaborator",
    status: "active",
    registeredAt: new Date("2024-01-15"),
    lastAccess: new Date("2024-01-20T09:30:00"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@company.com",
    password: "dXNlcjEyMw==",
    department: "Marketing",
    role: "collaborator",
    status: "active",
    registeredAt: new Date("2024-01-10"),
    lastAccess: new Date("2024-01-20T08:45:00"),
  },
  {
    id: "admin",
    name: "System Administrator",
    email: "admin@company.com",
    password: "YWRtaW4xMjM=", // admin123 encoded
    department: "IT",
    role: "admin",
    status: "active",
    registeredAt: new Date("2024-01-01"),
  },
]

const accessLogs: AccessLog[] = []
const notifications: Notification[] = []

// User operations
export const userOperations = {
  findByEmail: (email: string): User | undefined => {
    return users.find((user) => user.email === email)
  },

  findById: (id: string): User | undefined => {
    return users.find((user) => user.id === id)
  },

  create: (userData: Omit<User, "id" | "registeredAt">): User => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      registeredAt: new Date(),
    }
    users.push(newUser)
    return newUser
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const userIndex = users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    users[userIndex] = { ...users[userIndex], ...updates }
    return users[userIndex]
  },

  getAll: (): User[] => {
    return users
  },
}

// Access log operations
export const accessLogOperations = {
  create: (logData: Omit<AccessLog, "id">): AccessLog => {
    const newLog: AccessLog = {
      ...logData,
      id: Date.now().toString(),
    }
    accessLogs.push(newLog)
    return newLog
  },

  getByUserId: (userId: string): AccessLog[] => {
    return accessLogs.filter((log) => log.userId === userId)
  },

  getAll: (): AccessLog[] => {
    return accessLogs
  },

  getRecent: (limit = 50): AccessLog[] => {
    return accessLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  },
}

// Notification operations
export const notificationOperations = {
  create: (notificationData: Omit<Notification, "id">): Notification => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
    }
    notifications.push(newNotification)
    return newNotification
  },

  getAll: (): Notification[] => {
    return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  markAsRead: (id: string): boolean => {
    const notificationIndex = notifications.findIndex((n) => n.id === id)
    if (notificationIndex === -1) return false

    notifications[notificationIndex].read = true
    return true
  },

  getUnreadCount: (): number => {
    return notifications.filter((n) => !n.read).length
  },
}
