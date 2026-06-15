import type { WebinarDetails } from "./webinar";

export type NotificationChannel = "email" | "whatsapp";

export type MessageTemplateKey =
  | "payment_confirmation"
  | "two_days_before"
  | "one_day_before"
  | "one_hour_before";

export type RenderSeminarMessageInput = WebinarDetails & {
  name?: string | null;
  templateKey: MessageTemplateKey;
};

type RenderedMessage = {
  subject: string;
  text: string;
  html: string;
};

export function renderSeminarMessage({
  templateKey,
  name,
  dateLabel,
  timeLabel,
  joiningLink,
}: RenderSeminarMessageInput): RenderedMessage {
  const displayName = name?.trim() || "there";
  const scheduleLine = `${dateLabel} | ${timeLabel} | ${joiningLink}`;

  const messages: Record<MessageTemplateKey, { subject: string; text: string }> = {
    payment_confirmation: {
      subject: "Your masterclass registration is confirmed",
      text: `Dear ${displayName},

Thank you for registering for my upcoming masterclass — Successful on the Outside, Suffocated on the Inside (How Leaders can stop suppressing themselves and start leading freely).

I am happy to have you join. You will receive all joining details soon. Should you have any questions in the meantime, please feel free to reach out.

Block your calendar. I look forward to seeing you there.

Cheers,
Aastha Tatia`,
    },
    two_days_before: {
      subject: "Two days to go for the masterclass",
      text: `Two days to go.

${displayName}, you didn't register for this masterclass to learn another leadership framework.

You registered because somewhere beneath the success, responsibilities, and expectations, there may be things you're not saying, conversations you're avoiding, or a part of you that's longing to be more real.

In this session, we'll explore:
• Why silence is often a survival pattern—not a personality trait
• Why true authority comes from emotional honesty
• How to reclaim your voice without losing respect

If any part of leadership has been feeling heavy, lonely, or performative lately, I encourage you to be in the room.

${scheduleLine}

See you,
Aastha`,
    },
    one_day_before: {
      subject: "We are meeting tomorrow",
      text: `Dear ${displayName},

We're meeting tomorrow in the masterclass
"Successful on the Outside, Suffocated on the Inside"
(How Leaders can stop suppressing themselves and start leading freely)

One thing I've learned from working with leaders is this:

Many successful leaders privately carry the same questions—
"Why can't I say what I really think?"
"Why does leadership sometimes feel lonely?"
"Why am I successful, yet something feels missing?"

If you've ever felt any of these, you're not alone.

Tomorrow's masterclass is a space to pause, reflect, and discover a different way of leading—one rooted in authenticity, freedom, and emotional authority.

I look forward to sharing this conversation with you.

${scheduleLine}

Cheers,
Aastha`,
    },
    one_hour_before: {
      subject: "We begin in 1 hour",
      text: `${displayName}, we begin in 1 hour at ${timeLabel}.

You registered for a reason. Before the busyness of another week takes over, give yourself these hours.

For two hours, step away from performing leadership and explore what it means to lead with greater freedom, truth, and authenticity.

If you've been holding back your voice, carrying leadership alone, or longing for your leadership to feel more meaningful, this session is for you.

We're starting soon.

Join here:
${joiningLink}

Cheers,
Aastha Tatia`,
    },
  };

  const message = messages[templateKey];

  return {
    ...message,
    html: renderEmailHtml(message.text),
  };
}

function renderEmailHtml(text: string) {
  const paragraphs = escapeHtml(text)
    .split("\n\n")
    .map((block) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.7;white-space:pre-line;">${block}</p>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f6f1;color:#0a2540;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f6f1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e8ef;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0a2540;color:#ffffff;padding:28px 32px;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ffde17;">Authentic Leadership Circle</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-family:Georgia,serif;">Successful on the Outside, Suffocated on the Inside</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${paragraphs}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
