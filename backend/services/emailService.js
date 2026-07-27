import nodemailer from 'nodemailer';

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () => {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter || !to) return { skipped: true };

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
};

export const sendContactNotification = async (contact) => {
  if (!process.env.CONTACT_NOTIFY_EMAIL) return { skipped: true };

  return sendEmail({
    to: process.env.CONTACT_NOTIFY_EMAIL,
    subject: `New IEEE SB contact message: ${contact.subject}`,
    text: `${contact.name} <${contact.email}> wrote:\n\n${contact.message}`,
    html: `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p>${contact.message}</p>
    `,
  });
};
