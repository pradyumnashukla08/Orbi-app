import nodemailer from 'nodemailer';
import { env } from './env.js';

export const mailTransporter =
  env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

export const mailFrom = env.MAIL_FROM ?? env.SMTP_USER;

export const isMailConfigured = Boolean(mailTransporter && mailFrom);
