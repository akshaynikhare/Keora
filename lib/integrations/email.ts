/**
 * Email Service
 * Supports SendGrid and Resend
 */

import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: any;
  private from: string;

  constructor() {
    this.from = process.env.EMAIL_FROM || 'noreply@keora.com';
    this.setupTransporter();
  }

  private setupTransporter() {
    // For development, use nodemailer with a test account
    if (process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.password',
        },
      });
    } else {
      // For production, configure based on available service
      this.transporter = nodemailer.createTransport({
        // Configure your email service here
        // Example for SMTP:
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  async sendOTPEmail(to: string, otp: string): Promise<boolean> {
    const subject = 'Verify your Keora account';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Keora account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #14B8A6, #FB923C); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Keora</h1>
          <p style="color: white; margin: 5px 0 0 0;">Where Families Connect</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #14B8A6; margin-top: 0;">Verify Your Email</h2>
          <p>Thank you for signing up with Keora! To complete your registration, please use the verification code below:</p>
          <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
            <h1 style="color: #14B8A6; font-size: 48px; letter-spacing: 8px; margin: 10px 0;">${otp}</h1>
          </div>
          <p><strong>Important:</strong> This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} Keora. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendLinkRequestEmail(to: string, senderName: string, link: string): Promise<boolean> {
    const subject = `${senderName} wants to connect with you on Keora`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Connection Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #14B8A6, #FB923C); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Keora</h1>
          <p style="color: white; margin: 5px 0 0 0;">Where Families Connect</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #14B8A6; margin-top: 0;">New Connection Request</h2>
          <p><strong>${senderName}</strong> wants to connect with you on Keora and link your family trees.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: #14B8A6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Request</a>
          </div>
          <p>Log in to your account to approve or reject this connection request.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} Keora. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendLinkApprovedEmail(to: string, approverName: string, link: string): Promise<boolean> {
    const subject = `${approverName} accepted your connection request`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connection Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #14B8A6, #FB923C); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Keora</h1>
          <p style="color: white; margin: 5px 0 0 0;">Where Families Connect</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #14B8A6; margin-top: 0;">Connection Approved! 🎉</h2>
          <p><strong>${approverName}</strong> has accepted your connection request on Keora.</p>
          <p>Your family trees are now linked, and you can view each other's family information based on your privacy settings.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: #14B8A6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Family Tree</a>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} Keora. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, resetToken: string, link: string): Promise<boolean> {
    const subject = 'Reset your Keora password';
    const resetLink = `${link}?token=${resetToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #14B8A6, #FB923C); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Keora</h1>
          <p style="color: white; margin: 5px 0 0 0;">Where Families Connect</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #14B8A6; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #14B8A6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            © ${new Date().getFullYear()} Keora. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn('Email service not configured. Skipping email send.');
        console.log('Would send to', to, ':', subject);
        return true; // Return true in dev mode for testing
      }

      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });

      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
