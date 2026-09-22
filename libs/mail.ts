import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '127.0.0.1';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER || 'no-reply@ferilsunu.com';
const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS || '';
const appUrl = process.env.NEXTAUTH_URL || 'https://taskflow.ferilsunu.com';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpPass
    ? {
        user: smtpUser,
        pass: smtpPass,
      }
    : undefined,
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendVerificationEmail = async (name: string, email: string, code: string, token: string) => {
  const cleanAppUrl = appUrl.replace(/\/$/, '');
  const verifyLink = `${cleanAppUrl}/api/auth/verify-link?token=${token}&email=${encodeURIComponent(email)}`;
  const userName = name || 'there';

  // 1. Plain-text alternative (essential for zero spam score)
  const text = `Hello ${userName},

Thank you for joining TaskFlow.

Your 6-digit verification code is: ${code}

Alternatively, you can verify your account by opening the following link in your browser:
${verifyLink}

This code will expire in 15 minutes.
If you did not request this verification code, please ignore this email.

Best regards,
The TaskFlow Team
${cleanAppUrl}
`;

  // 2. Beautiful, clean responsive HTML template
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Your TaskFlow Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 32px 16px; color: #111827; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px;">
              <!-- Header -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #111827;">TaskFlow</span>
              </div>

              <!-- Greeting -->
              <h1 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0; color: #111827; line-height: 1.4;">
                Verify your email address
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Hi <strong>${userName}</strong>, welcome to TaskFlow! Please use the following 6-digit verification code to complete your registration:
              </p>

              <!-- OTP Code Box -->
              <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
                <span style="letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; font-size: 30px; font-weight: 800; color: #111827; display: inline-block; padding-left: 8px;">
                  ${code}
                </span>
              </div>

              <!-- Button Direct Verify Link -->
              <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px 0; text-align: center;">
                Or tap the button below to verify instantly:
              </p>
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${verifyLink}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none;">
                  Verify Email Address
                </a>
              </div>

              <!-- Expiry & Security Notice -->
              <div style="border-top: 1px solid #f3f4f6; padding-top: 18px; margin-top: 12px;">
                <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; margin: 0 0 8px 0;">
                  ⏱ This code is valid for <strong>15 minutes</strong>. If you did not create a TaskFlow account, you can safely ignore this email.
                </p>
                <p style="font-size: 11px; color: #d1d5db; margin: 0;">
                  TaskFlow Productivity App · <a href="${cleanAppUrl}" style="color: #9ca3af; text-decoration: none;">${cleanAppUrl}</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"TaskFlow" <${smtpUser}>`,
    to: email,
    subject: `Your TaskFlow verification code is ${code}`,
    text,
    html,
    headers: {
      'X-Entity-Ref-ID': `taskflow-otp-${Date.now()}`,
    },
  });
};

export const sendTaskReminderEmail = async (
  email: string,
  name: string,
  task: { id: string; title: string; notes?: string | null; priority: string; category: string; dueDate?: string | null }
) => {
  const cleanAppUrl = appUrl.replace(/\/$/, '');
  const taskUrl = `${cleanAppUrl}/`;
  const userName = name || 'there';

  const text = `Hi ${userName},

Here is your scheduled TaskFlow reminder for:
Task: ${task.title}
Category: ${task.category}
Priority: ${task.priority.toUpperCase()}
${task.dueDate ? `Due Date: ${task.dueDate}\n` : ''}
${task.notes ? `Notes: ${task.notes}\n` : ''}

Open TaskFlow: ${taskUrl}

Best regards,
The TaskFlow Team
`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 32px 16px; color: #111827;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px;">
              <div style="margin-bottom: 20px;">
                <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #111827;">TaskFlow</span>
              </div>
              <p style="font-size: 14px; color: #4b5563; margin: 0 0 16px 0;">
                Hi <strong>${userName}</strong>, here is your scheduled reminder:
              </p>
              <div style="background-color: #f9fafb; border-left: 4px solid #111827; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">${task.title}</h3>
                ${task.notes ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">${task.notes}</p>` : ''}
                <div style="font-size: 12px; color: #6b7280; padding-top: 6px;">
                  <span>Category: <strong>${task.category}</strong></span> · 
                  <span>Priority: <strong>${task.priority.toUpperCase()}</strong></span>
                  ${task.dueDate ? ` · <span>Due: <strong>${task.dueDate}</strong></span>` : ''}
                </div>
              </div>
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${taskUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none;">
                  Open TaskFlow
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"TaskFlow Reminders" <${smtpUser}>`,
    to: email,
    subject: `Reminder: ${task.title}`,
    text,
    html,
  });
};
