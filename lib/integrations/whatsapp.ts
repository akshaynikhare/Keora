/**
 * WhatsApp OTP Service
 * Supports multiple providers: Gupshup, Interakt, Twilio
 */

interface WhatsAppMessage {
  to: string;
  body: string;
}

export class WhatsAppService {
  private apiKey: string;
  private apiUrl: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.senderId = process.env.WHATSAPP_SENDER_ID || '';
  }

  async sendOTP(mobile: string, otp: string): Promise<boolean> {
    const message = `Your Keora verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;

    return this.sendMessage(mobile, message);
  }

  async sendLinkRequestNotification(mobile: string, senderName: string): Promise<boolean> {
    const message = `${senderName} wants to connect with you on Keora family tree. Log in to your account to approve or reject this request.`;

    return this.sendMessage(mobile, message);
  }

  async sendLinkApprovedNotification(mobile: string, approverName: string): Promise<boolean> {
    const message = `${approverName} has accepted your connection request on Keora. Your family trees are now linked!`;

    return this.sendMessage(mobile, message);
  }

  private async sendMessage(mobile: string, body: string): Promise<boolean> {
    if (!this.apiKey || !this.apiUrl) {
      console.warn('WhatsApp API not configured. Skipping message send.');
      console.log('Would send to', mobile, ':', body);
      return true; // Return true in dev mode for testing
    }

    try {
      // Example for generic WhatsApp API
      // Adjust based on your provider (Gupshup, Interakt, Twilio)
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: mobile,
          type: 'text',
          text: {
            body: body,
          },
          from: this.senderId,
        }),
      });

      if (!response.ok) {
        console.error('WhatsApp API error:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  // Gupshup specific implementation
  private async sendMessageGupshup(mobile: string, body: string): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': this.apiKey,
        },
        body: new URLSearchParams({
          channel: 'whatsapp',
          source: this.senderId,
          destination: mobile,
          'src.name': 'Keora',
          'message': JSON.stringify({
            type: 'text',
            text: body,
          }),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Gupshup error:', error);
      return false;
    }
  }

  // Twilio specific implementation
  private async sendMessageTwilio(mobile: string, body: string): Promise<boolean> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          },
          body: new URLSearchParams({
            From: `whatsapp:${this.senderId}`,
            To: `whatsapp:${mobile}`,
            Body: body,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Twilio error:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
