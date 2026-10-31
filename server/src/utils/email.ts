import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: env.SMTP_PORT === '465',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; previewUrl?: string }> {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send email via SMTP transporter:', error);
      // Fallback to dev log below
    }
  }

  // Safe development mode preview - logs clearly to console without pretending email sent externally
  console.log('\n========================================');
  console.log('📧 [DEVELOPMENT EMAIL PREVIEW]');
  console.log(`To: ${options.to}`);
  console.log(`From: ${env.EMAIL_FROM}`);
  console.log(`Subject: ${options.subject}`);
  console.log('Body:');
  console.log(options.text || options.html);
  console.log('========================================\n');

  return { success: true, previewUrl: 'Console preview (Development Mode)' };
}

export async function sendPasswordResetEmail(email: string, resetToken: string, baseUrl?: string): Promise<void> {
  const origin = (baseUrl ? baseUrl.replace(/\/$/, '') : null) || env.CLIENT_URL || 'http://localhost:3000';
  const resetLink = `${origin}/reset-password?token=${resetToken}`;
  const subject = 'Reset your Subscriptly password';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #171923; background: #ffffff; border-radius: 12px; border: 1px solid #E8EAF0;">
      <h2 style="color: #3B3DC0; margin-top: 0;">Subscriptly</h2>
      <p style="font-size: 16px; line-height: 24px;">Hello,</p>
      <p style="font-size: 15px; line-height: 22px; color: #464554;">We received a request to reset the password for your Subscriptly account. Click the button below to proceed. This link expires in 1 hour.</p>
      <div style="margin: 28px 0;">
        <a href="${resetLink}" style="background-color: #3B3DC0; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 13px; line-height: 20px; color: #767585;">If button does not work, copy and paste this link in your browser:<br/><a href="${resetLink}" style="color: #3B3DC0;">${resetLink}</a></p>
      <p style="font-size: 13px; line-height: 20px; color: #767585;">If you did not request this change, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #E8EAF0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #767585;">Subscriptly by Brightloop Software — Enterprise Subscription Management</p>
    </div>
  `;
  const text = `Reset your Subscriptly password: ${resetLink} (Link expires in 1 hour). If you did not request this, please ignore.`;

  await sendEmail({ to: email, subject, html, text });
}
