import nodemailer from "nodemailer";
import { parseBoolean, requiredEnv } from "./env";
import { renderSeminarMessage, type MessageTemplateKey } from "./message-templates";
import type { WebinarDetails } from "./webinar";

export type CustomerEmailInput = {
  to: string;
  customerName?: string | null;
};

type SendMailResult = {
  messageId?: string;
};

const DEFAULT_SMTP_HOST = "smtpout.secureserver.net";
const DEFAULT_SMTP_PORT = 465;
const DEFAULT_SMTP_SECURE = true;
const DEFAULT_SMTP_USER = "connect@authenticleadershipcircle.com";
const DEFAULT_SMTP_FROM_EMAIL = "connect@authenticleadershipcircle.com";
const DEFAULT_SMTP_FROM_NAME = "Authentic Leadership Circle";

export type SeminarEmailInput = {
  to: string;
  customerName?: string | null;
  templateKey: MessageTemplateKey;
  webinar: WebinarDetails;
};

export async function sendCustomerConfirmationEmail({
  to,
  customerName,
}: CustomerEmailInput): Promise<SendMailResult> {
  const fallbackDate = new Date();
  const message = renderSeminarMessage({
    templateKey: "payment_confirmation",
    name: customerName,
    startAt: fallbackDate,
    dateLabel: "the masterclass date",
    timeLabel: "the masterclass time",
    joiningLink: "Joining link will be shared soon.",
  });

  return sendMail({
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

export async function sendSeminarEmail({
  to,
  customerName,
  templateKey,
  webinar,
}: SeminarEmailInput): Promise<SendMailResult> {
  const message = renderSeminarMessage({
    ...webinar,
    templateKey,
    name: customerName,
  });

  return sendMail({
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || DEFAULT_SMTP_HOST,
    port: Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT),
    secure: process.env.SMTP_SECURE ? parseBoolean(process.env.SMTP_SECURE) : DEFAULT_SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER || DEFAULT_SMTP_USER,
      pass: requiredEnv("SMTP_PASS"),
    },
  });

  const fromName = process.env.SMTP_FROM_NAME || DEFAULT_SMTP_FROM_NAME;
  const fromEmail = process.env.SMTP_FROM_EMAIL || DEFAULT_SMTP_FROM_EMAIL;
  const result = await transporter.sendMail({
    from: `"${fromName.replace(/"/g, "'")}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return { messageId: result.messageId };
}
