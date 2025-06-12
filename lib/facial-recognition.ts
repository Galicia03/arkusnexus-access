// Facial Recognition Service with multiple API providers
import { notificationOperations, userOperations } from "./database"

export interface FaceDescriptor {
  id: string
  encoding: number[]
  confidence: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface RecognitionResult {
  recognized: boolean
  userId?: string
  userName?: string
  confidence: number
  faceDescriptor: FaceDescriptor
  provider: string
}

export interface UnrecognizedFace {
  id: string
  imageData: string
  faceDescriptor: FaceDescriptor
  timestamp: Date
  location: string
  deviceId: string
  grouped: boolean
  groupId?: string
  attempts: number
}

// Mock face descriptors for demo (in production, these would come from the API)
const mockFaceDescriptors = new Map<string, number[]>([
  ["1", [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]], // Ana García
  ["2", [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]], // Carlos López
  ["3", [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]], // María Rodríguez
])

// Store for unrecognized faces
let unrecognizedFaces: UnrecognizedFace[] = []
const faceGroups: Map<string, UnrecognizedFace[]> = new Map()

export class FacialRecognitionService {
  private provider: "azure" | "google" | "aws" | "mock"
  private apiKey: string
  private endpoint: string

  constructor(provider: "azure" | "google" | "aws" | "mock" = "mock", apiKey = "", endpoint = "") {
    this.provider = provider
    this.apiKey = apiKey
    this.endpoint = endpoint
  }

  // Extract face descriptor from image
  async extractFaceDescriptor(imageData: string): Promise<FaceDescriptor | null> {
    try {
      switch (this.provider) {
        case "azure":
          return await this.extractWithAzure(imageData)
        case "google":
          return await this.extractWithGoogle(imageData)
        case "aws":
          return await this.extractWithAWS(imageData)
        default:
          return this.extractWithMock(imageData)
      }
    } catch (error) {
      console.error("Face extraction error:", error)
      return null
    }
  }

  // Mock implementation for demo
  private extractWithMock(imageData: string): FaceDescriptor {
    // Generate random face descriptor for demo
    const encoding = Array.from({ length: 128 }, () => Math.random() * 2 - 1)

    return {
      id: Date.now().toString(),
      encoding,
      confidence: 0.95,
      boundingBox: {
        x: 100 + Math.random() * 200,
        y: 80 + Math.random() * 150,
        width: 150 + Math.random() * 100,
        height: 180 + Math.random() * 120,
      },
    }
  }

  // Azure Face API implementation
  private async extractWithAzure(imageData: string): Promise<FaceDescriptor | null> {
    const response = await fetch(`${this.endpoint}/face/v1.0/detect`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: imageData.startsWith("data:") ? undefined : imageData,
        data: imageData.startsWith("data:") ? imageData.split(",")[1] : undefined,
        returnFaceId: true,
        returnFaceLandmarks: false,
        returnFaceAttributes: "age,gender,emotion",
        recognitionModel: "recognition_04",
        returnRecognitionModel: false,
        detectionModel: "detection_03",
      }),
    })

    const faces = await response.json()
    if (faces.length === 0) return null

    const face = faces[0]
    return {
      id: face.faceId,
      encoding: [], // Azure uses faceId instead of encoding
      confidence: 0.95,
      boundingBox: {
        x: face.faceRectangle.left,
        y: face.faceRectangle.top,
        width: face.faceRectangle.width,
        height: face.faceRectangle.height,
      },
    }
  }

  // Google Cloud Vision API implementation
  private async extractWithGoogle(imageData: string): Promise<FaceDescriptor | null> {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageData.startsWith("data:") ? imageData.split(",")[1] : imageData,
            },
            features: [
              {
                type: "FACE_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    })

    const result = await response.json()
    const faces = result.responses[0]?.faceAnnotations
    if (!faces || faces.length === 0) return null

    const face = faces[0]
    return {
      id: Date.now().toString(),
      encoding: [], // Google doesn't provide face encodings directly
      confidence: face.detectionConfidence,
      boundingBox: {
        x: face.boundingPoly.vertices[0].x,
        y: face.boundingPoly.vertices[0].y,
        width: face.boundingPoly.vertices[2].x - face.boundingPoly.vertices[0].x,
        height: face.boundingPoly.vertices[2].y - face.boundingPoly.vertices[0].y,
      },
    }
  }

  // AWS Rekognition implementation
  private async extractWithAWS(imageData: string): Promise<FaceDescriptor | null> {
    // AWS SDK implementation would go here
    // This is a simplified version
    const response = await fetch(`${this.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "RekognitionService.DetectFaces",
        Authorization: `AWS4-HMAC-SHA256 ${this.apiKey}`,
      },
      body: JSON.stringify({
        Image: {
          Bytes: imageData.startsWith("data:") ? imageData.split(",")[1] : imageData,
        },
        Attributes: ["ALL"],
      }),
    })

    const result = await response.json()
    const faces = result.FaceDetails
    if (!faces || faces.length === 0) return null

    const face = faces[0]
    return {
      id: Date.now().toString(),
      encoding: [], // AWS uses different face matching approach
      confidence: face.Confidence / 100,
      boundingBox: {
        x: face.BoundingBox.Left * 1000, // Assuming 1000px width
        y: face.BoundingBox.Top * 1000,
        width: face.BoundingBox.Width * 1000,
        height: face.BoundingBox.Height * 1000,
      },
    }
  }

  // Compare face descriptor against registered users
  async recognizeFace(faceDescriptor: FaceDescriptor): Promise<RecognitionResult> {
    const users = userOperations.getAll().filter((u) => u.role === "collaborator" && u.status === "active")

    let bestMatch: { userId: string; userName: string; confidence: number } | null = null

    for (const user of users) {
      if (!user.faceData) continue

      // In mock mode, use simple comparison
      if (this.provider === "mock") {
        const userDescriptor = mockFaceDescriptors.get(user.id)
        if (userDescriptor) {
          const similarity = this.calculateSimilarity(faceDescriptor.encoding, userDescriptor)
          if (similarity > 0.75 && (!bestMatch || similarity > bestMatch.confidence)) {
            bestMatch = {
              userId: user.id,
              userName: user.name,
              confidence: similarity,
            }
          }
        }
      }
    }

    if (bestMatch && bestMatch.confidence > 0.75) {
      return {
        recognized: true,
        userId: bestMatch.userId,
        userName: bestMatch.userName,
        confidence: bestMatch.confidence,
        faceDescriptor,
        provider: this.provider,
      }
    }

    return {
      recognized: false,
      confidence: bestMatch?.confidence || 0,
      faceDescriptor,
      provider: this.provider,
    }
  }

  // Calculate similarity between two face encodings
  private calculateSimilarity(encoding1: number[], encoding2: number[]): number {
    if (encoding1.length !== encoding2.length) return 0

    let sum = 0
    for (let i = 0; i < encoding1.length; i++) {
      sum += Math.pow(encoding1[i] - encoding2[i], 2)
    }
    const distance = Math.sqrt(sum)
    return Math.max(0, 1 - distance / 2) // Convert distance to similarity
  }

  // Handle unrecognized face with grouping
  async handleUnrecognizedFace(
    imageData: string,
    faceDescriptor: FaceDescriptor,
    location: string,
    deviceId: string,
  ): Promise<string> {
    // Check if this face belongs to an existing group
    const existingGroup = this.findSimilarFaceGroup(faceDescriptor)

    const unrecognizedFace: UnrecognizedFace = {
      id: Date.now().toString(),
      imageData,
      faceDescriptor,
      timestamp: new Date(),
      location,
      deviceId,
      grouped: !!existingGroup,
      groupId: existingGroup?.groupId,
      attempts: 1,
    }

    if (existingGroup) {
      // Add to existing group
      existingGroup.faces.push(unrecognizedFace)
      existingGroup.faces[0].attempts += 1

      // Only send notification if it's been more than 30 minutes since last notification
      const lastNotification = existingGroup.lastNotification
      const now = new Date()
      if (!lastNotification || now.getTime() - lastNotification.getTime() > 30 * 60 * 1000) {
        await this.sendGroupedNotification(existingGroup)
        existingGroup.lastNotification = now
      }
    } else {
      // Create new group
      const groupId = `group_${Date.now()}`
      const newGroup = {
        groupId,
        faces: [unrecognizedFace],
        lastNotification: new Date(),
      }

      faceGroups.set(groupId, newGroup.faces)
      unrecognizedFace.groupId = groupId

      // Send immediate notification for new face
      await this.sendUnrecognizedFaceNotification(unrecognizedFace)
    }

    unrecognizedFaces.push(unrecognizedFace)
    return unrecognizedFace.id
  }

  // Find similar face group
  private findSimilarFaceGroup(faceDescriptor: FaceDescriptor): {
    groupId: string
    faces: UnrecognizedFace[]
    lastNotification: Date
  } | null {
    for (const [groupId, faces] of faceGroups) {
      if (faces.length === 0) continue

      const representativeFace = faces[0]
      const similarity = this.calculateSimilarity(faceDescriptor.encoding, representativeFace.faceDescriptor.encoding)

      if (similarity > 0.85) {
        // 85% similarity threshold for grouping
        return {
          groupId,
          faces,
          lastNotification: new Date(), // This would be stored properly in production
        }
      }
    }

    return null
  }

  // Send notification for unrecognized face
  private async sendUnrecognizedFaceNotification(face: UnrecognizedFace) {
    const notification = notificationOperations.create({
      type: "unauthorized_access",
      message: `Rostro no reconocido detectado en ${face.location}`,
      timestamp: face.timestamp,
      read: false,
    })

    // In production, send email/SMS/push notification here
    console.log("Sending unrecognized face notification:", notification)
  }

  // Send grouped notification
  private async sendGroupedNotification(group: { groupId: string; faces: UnrecognizedFace[] }) {
    const face = group.faces[0]
    const notification = notificationOperations.create({
      type: "unauthorized_access",
      message: `Persona no reconocida detectada ${group.faces.length} veces. Última ubicación: ${
        group.faces[group.faces.length - 1].location
      }`,
      timestamp: new Date(),
      read: false,
    })

    console.log("Sending grouped notification:", notification)
  }

  // Get all unrecognized faces
  getUnrecognizedFaces(): UnrecognizedFace[] {
    return unrecognizedFaces
  }

  // Get face groups
  getFaceGroups(): Map<string, UnrecognizedFace[]> {
    return faceGroups
  }

  // Register a face to a user
  async registerFaceToUser(faceId: string, userId: string): Promise<boolean> {
    const face = unrecognizedFaces.find((f) => f.id === faceId)
    if (!face) return false

    const user = userOperations.findById(userId)
    if (!user) return false

    // Update user with face data
    userOperations.update(userId, {
      faceData: JSON.stringify(face.faceDescriptor.encoding),
    })

    // Add to mock descriptors for future recognition
    mockFaceDescriptors.set(userId, face.faceDescriptor.encoding)

    // Remove from unrecognized faces
    unrecognizedFaces = unrecognizedFaces.filter((f) => f.id !== faceId)

    // Remove from groups if it was the last face in the group
    if (face.groupId) {
      const group = faceGroups.get(face.groupId)
      if (group) {
        const updatedGroup = group.filter((f) => f.id !== faceId)
        if (updatedGroup.length === 0) {
          faceGroups.delete(face.groupId)
        } else {
          faceGroups.set(face.groupId, updatedGroup)
        }
      }
    }

    return true
  }
}

// Global instance
export const facialRecognitionService = new FacialRecognitionService()
