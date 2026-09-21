import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '127.0.0.1';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER || '';
const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS || '';
const appUrl = process.env.NEXTAUTH_URL || 'https://taskflow.ferilsunu.com';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendVerificationEmail = async (name: string, email: string, code: string, token: string) => {
  const verifyLink = `${appUrl.replace(/\/$/, '')}/api/auth/verify-link?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your TaskFlow Account</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 30px 15px; color: #111827;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: #111827;">TaskFlow</h1>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Welcome, ${name || 'there'}!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
            Thank you for registering. Please enter the following 6-digit verification code in TaskFlow to confirm your email:
          </p>
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; letter-spacing: 6px; font-size: 28px; font-weight: 800; color: #111827;">
            ${code}
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px 0;">
            Or click the direct confirmation button below:
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${verifyLink}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            This code will expire in 15 minutes. If you did not create this account, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"TaskFlow" <${smtpUser || 'no-reply@ferilsunu.com'}>`,
    to: email,
    subject: `Verify your TaskFlow account - Code: ${code}`,
    html,
  });
};

export const sendTaskReminderEmail = async (
  email: string,
  name: string,
  task: { id: string; title: string; notes?: string | null; priority: string; category: string; dueDate?: string | null }
) => {
  const taskUrl = `${appUrl.replace(/\/$/, '')}/`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Task Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 30px 15px; color: #111827;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="margin-bottom: 20px;">
            <h1 style="font-size: 22px; font-weight: 800; margin: 0; color: #111827;">TaskFlow Reminder</h1>
          </div>
          <p style="font-size: 14px; color: #4b5563; margin: 0 0 16px 0;">
            Hi ${name || 'there'}, here is your scheduled reminder for:
          </p>
          <div style="background-color: #f9fafb; border-left: 4px solid #111827; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">${task.title}</h3>
            ${task.notes ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">${task.notes}</p>` : ''}
            <div style="font-size: 12px; color: #9ca3af;">
              <span>Category: <strong>${task.category}</strong></span> | 
              <span>Priority: <strong>${task.priority.toUpperCase()}</strong></span>
              ${task.dueDate ? ` | <span>Due: <strong>${task.dueDate}</strong></span>` : ''}
            </div>
          </div>
          <div style="text-align: center;">
            <a href="${taskUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none;">
              Open TaskFlow
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"TaskFlow Reminders" <${smtpUser || 'no-reply@ferilsunu.com'}>`,
    to: email,
    subject: `Reminder: ${task.title}`,
    html,
  });
};
