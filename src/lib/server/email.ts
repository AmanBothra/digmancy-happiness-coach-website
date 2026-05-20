import nodemailer from "nodemailer";

export type CustomerEmailInput = {
  to: string;
  customerName?: string | null;
};

type SendMailResult = {
  messageId?: string;
};

export async function sendCustomerConfirmationEmail({
  to,
  customerName,
}: CustomerEmailInput): Promise<SendMailResult> {
  const transporter = nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT || 587),
    secure: parseBoolean(process.env.SMTP_SECURE),
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS"),
    },
  });

  const fromName = process.env.SMTP_FROM_NAME || "Authentic Leadership Circle";
  const fromEmail = requiredEnv("SMTP_FROM_EMAIL");
  const result = await transporter.sendMail({
    from: `"${fromName.replace(/"/g, "'")}" <${fromEmail}>`,
    to,
    subject: "Your Authentic Leadership masterclass seat is confirmed",
    html: renderCustomerConfirmationEmail(customerName),
  });

  return { messageId: result.messageId };
}

export function renderCustomerConfirmationEmail(customerName?: string | null) {
  const greetingName = customerName?.trim()
    ? escapeHtml(customerName.trim())
    : "there";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f6f1;color:#0a2540;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f6f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e8ef;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0a2540;color:#ffffff;padding:28px 32px;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ffde17;">Authentic Leadership Circle</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-family:Georgia,serif;">Your seat is confirmed</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 18px;font-size:18px;line-height:1.6;">Hi ${greetingName},</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
                  Thank you for registering for the Authentic Leadership masterclass. We have received your payment and your seat is confirmed.
                </p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">
                  The joining details will be shared with you before the masterclass. Please keep an eye on this inbox for further updates.
                </p>
                <div style="background:#fff8c9;border:1px solid #ffde17;border-radius:12px;padding:18px 20px;margin:24px 0;">
                  <p style="margin:0;font-size:15px;line-height:1.6;">
                    We look forward to seeing you in the live session.
                  </p>
                </div>
                <p style="margin:24px 0 0;font-size:16px;line-height:1.7;">
                  Warmly,<br />
                  Authentic Leadership Circle
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function parseBoolean(value?: string) {
  return value === "true" || value === "1";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
