import { env } from '../config/env.js';
import { isMailConfigured, mailFrom, mailTransporter } from '../config/nodemailer.config.js';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  const { to, subject, html, text } = options;

  if (!subject) {
    throw new Error('Email subject is required');
  }

  if (!html && !text) {
    throw new Error('Email body is required; provide html or text');
  }

  if (!isMailConfigured || !mailTransporter || !mailFrom) {
    if (env.NODE_ENV !== 'production') {
      console.log(`[mail] (dev) To: ${to}, Subject: ${subject}`);
      return;
    }
    throw new Error('Email service is not configured');
  }

  await mailTransporter.sendMail({
    from: { name: env.MAIL_FROM_NAME, address: mailFrom },
    to,
    subject,
    html,
    text,
  });
};