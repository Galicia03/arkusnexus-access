// Comprehensive notification service for real-time alerts

export interface NotificationChannel {
  type: "email" | "sms" | "push" | "webhook"
  enabled: boolean
  config: Record<string, any>
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  body: string
  channels: string[]
}

export interface NotificationPreferences {
  userId: string
  channels: NotificationChannel[]
  templates: Record<string, boolean>
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export class NotificationService {
  private preferences: Map<string, NotificationPreferences> = new Map()
  private templates: Map<string, NotificationTemplate> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates() {
    const templates: NotificationTemplate[] = [
      {
        id: "unrecognized_face",
        name: "Rostro No Reconocido",
        subject: "🚨 Alerta de Seguridad - Rostro No Reconocido",
        body: `
          Se ha detectado un rostro no reconocido en el sistema de control de acceso.
          
          📍 Ubicación: {{location}}
          🕐 Fecha y Hora: {{timestamp}}
          🖥️ Dispositivo: {{deviceId}}
          📊 Intentos: {{attempts}}
          
          Por favor, revise la imagen adjunta y tome las medidas necesarias.
          
          Puede gestionar este incidente desde el panel administrativo.
        `,
        channels: ["email", "push"],
      },
      {
        id: "grouped_faces",
        name: "Rostros Agrupados",
        subject: "🔄 Múltiples Intentos - Misma Persona",
        body: `
          Se han detectado múltiples intentos de acceso de la misma persona no reconocida.
          
          📍 Última Ubicación: {{location}}
          🕐 Último Intento: {{timestamp}}
          📊 Total de Intentos: {{attempts}}
          
          Esta persona ha intentado acceder {{attempts}} veces en las últimas horas.
          
          Revise el panel administrativo para más detalles.
        `,
        channels: ["email", "sms"],
      },
      {
        id: "system_alert",
        name: "Alerta del Sistema",
        subject: "⚠️ Alerta del Sistema de Acceso",
        body: `
          Se ha generado una alerta en el sistema de control de acceso.
          
          🔔 Tipo: {{alertType}}
          📝 Mensaje: {{message}}
          🕐 Fecha y Hora: {{timestamp}}
          
          Revise el sistema para más información.
        `,
        channels: ["email", "push"],
      },
    ]

    templates.forEach((template) => {
      this.templates.set(template.id, template)
    })
  }

  // Send notification using multiple channels
  async sendNotification(
    templateId: string,
    recipients: string[],
    variables: Record<string, any>,
    attachments?: { name: string; data: string; type: string }[],
  ): Promise<boolean> {
    const template = this.templates.get(templateId)
    if (!template) {
      console.error(`Template ${templateId} not found`)
      return false
    }

    const results = await Promise.all(
      recipients.map(async (recipient) => {
        const preferences = this.preferences.get(recipient)
        const channels = preferences?.channels || this.getDefaultChannels()

        const enabledChannels = channels.filter((ch) => ch.enabled)

        return Promise.all(
          enabledChannels.map(async (channel) => {
            if (!template.channels.includes(channel.type)) return true

            // Check quiet hours
            if (preferences?.quietHours.enabled && this.isQuietHours(preferences.quietHours)) {
              if (channel.type !== "email") return true // Only email during quiet hours
            }

            return this.sendToChannel(channel, template, variables, attachments)
          }),
        )
      }),
    )

    return results.every((channelResults) => channelResults.every((result) => result))
  }

  // Send to specific channel
  private async sendToChannel(
    channel: NotificationChannel,
    template: NotificationTemplate,
    variables: Record<string, any>,
    attachments?: { name: string; data: string; type: string }[],
  ): Promise<boolean> {
    const subject = this.replaceVariables(template.subject, variables)
    const body = this.replaceVariables(template.body, variables)

    try {
      switch (channel.type) {
        case "email":
          return await this.sendEmail(channel.config, subject, body, attachments)
        case "sms":
          return await this.sendSMS(channel.config, body)
        case "push":
          return await this.sendPushNotification(channel.config, subject, body)
        case "webhook":
          return await this.sendWebhook(channel.config, { subject, body, variables })
        default:
          return false
      }
    } catch (error) {
      console.error(`Failed to send ${channel.type} notification:`, error)
      return false
    }
  }

  // Email implementation
  private async sendEmail(
    config: any,
    subject: string,
    body: string,
    attachments?: { name: string; data: string; type: string }[],
  ): Promise<boolean> {
    // In production, integrate with services like SendGrid, AWS SES, etc.
    console.log("📧 Sending email:", { subject, body, attachments })

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ Email sent successfully")
        resolve(true)
      }, 1000)
    })
  }

  // SMS implementation
  private async sendSMS(config: any, message: string): Promise<boolean> {
    // In production, integrate with services like Twilio, AWS SNS, etc.
    console.log("📱 Sending SMS:", message)

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ SMS sent successfully")
        resolve(true)
      }, 500)
    })
  }

  // Push notification implementation
  private async sendPushNotification(config: any, title: string, body: string): Promise<boolean> {
    // In production, integrate with Firebase Cloud Messaging, Apple Push Notifications, etc.
    console.log("🔔 Sending push notification:", { title, body })

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ Push notification sent successfully")
        resolve(true)
      }, 300)
    })
  }

  // Webhook implementation
  private async sendWebhook(config: any, payload: any): Promise<boolean> {
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: config.authorization || "",
        },
        body: JSON.stringify(payload),
      })

      return response.ok
    } catch (error) {
      console.error("Webhook error:", error)
      return false
    }
  }

  // Replace variables in template
  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match
    })
  }

  // Check if current time is within quiet hours
  private isQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = quietHours.start.split(":").map(Number)
    const [endHour, endMin] = quietHours.end.split(":").map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  // Get default notification channels
  private getDefaultChannels(): NotificationChannel[] {
    return [
      {
        type: "email",
        enabled: true,
        config: {
          to: "admin@empresa.com",
          from: "sistema@empresa.com",
        },
      },
      {
        type: "push",
        enabled: true,
        config: {
          deviceToken: "admin_device_token",
        },
      },
    ]
  }

  // Configure user preferences
  setUserPreferences(userId: string, preferences: NotificationPreferences) {
    this.preferences.set(userId, preferences)
  }

  // Get user preferences
  getUserPreferences(userId: string): NotificationPreferences | null {
    return this.preferences.get(userId) || null
  }
}

// Global instance
export const notificationService = new NotificationService()
