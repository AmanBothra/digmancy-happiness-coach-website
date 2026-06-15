import { sendSeminarEmail } from "./email";
import {
  renderSeminarMessage,
  type MessageTemplateKey,
  type NotificationChannel,
} from "./message-templates";
import type {
  RegistrationDatabase,
  ScheduledNotification,
  SeminarRegistration,
} from "./registration-db";
import { sendWhatsappMessage } from "./whatsapp";
import { getReminderSchedule, type WebinarDetails } from "./webinar";

export type SendNotificationInput = {
  db: RegistrationDatabase;
  registration: SeminarRegistration;
  channel: NotificationChannel;
  templateKey: MessageTemplateKey;
  scheduledFor?: Date | string | null;
};

export async function sendAndRecordNotification({
  db,
  registration,
  channel,
  templateKey,
  scheduledFor,
}: SendNotificationInput) {
  const webinar = webinarDetailsFromRegistration(registration);
  const recipient = channel === "email" ? registration.email : registration.mobile;

  if (!recipient) {
    await db.recordNotificationLog({
      registrationId: registration.id,
      orderId: registration.order_id,
      channel,
      templateKey,
      status: "skipped",
      error: `Missing ${channel} recipient`,
      scheduledFor,
    });
    return { sent: false, skipped: true };
  }

  if (!scheduledFor && (await db.hasSentNotification(registration.order_id, channel, templateKey))) {
    return { sent: false, duplicate: true };
  }

  try {
    if (channel === "email") {
      const result = await sendSeminarEmail({
        to: recipient,
        customerName: registration.name,
        templateKey,
        webinar,
      });

      await db.recordNotificationLog({
        registrationId: registration.id,
        orderId: registration.order_id,
        channel,
        templateKey,
        recipient,
        status: "sent",
        providerMessageId: result.messageId,
        scheduledFor,
        sentAt: new Date(),
      });

      return { sent: true };
    }

    const renderedMessage = renderSeminarMessage({
      ...webinar,
      templateKey,
      name: registration.name,
    });
    const result = await sendWhatsappMessage({
      to: recipient,
      name: registration.name,
      templateKey,
      message: renderedMessage.text,
    });

    await db.recordNotificationLog({
      registrationId: registration.id,
      orderId: registration.order_id,
      channel,
      templateKey,
      recipient,
      status: result.skipped ? "skipped" : "sent",
      providerMessageId: result.messageId,
      error: result.error,
      scheduledFor,
      sentAt: result.skipped ? null : new Date(),
    });

    return { sent: !result.skipped, skipped: result.skipped };
  } catch (error) {
    await db.recordNotificationLog({
      registrationId: registration.id,
      orderId: registration.order_id,
      channel,
      templateKey,
      recipient,
      status: "failed",
      error: errorMessage(error),
      scheduledFor,
    });

    throw error;
  }
}

export async function scheduleReminderNotifications(
  db: RegistrationDatabase,
  registration: SeminarRegistration,
) {
  if (registration.reminders_scheduled_at) {
    return;
  }

  const webinar = webinarDetailsFromRegistration(registration);
  const schedule = getReminderSchedule(webinar.startAt);

  await db.queueScheduledNotifications(
    schedule.flatMap((item) => [
      {
        registrationId: registration.id,
        orderId: registration.order_id,
        channel: "email" as const,
        templateKey: item.templateKey,
        recipient: registration.email,
        scheduledFor: item.scheduledFor,
      },
      {
        registrationId: registration.id,
        orderId: registration.order_id,
        channel: "whatsapp" as const,
        templateKey: item.templateKey,
        recipient: registration.mobile,
        scheduledFor: item.scheduledFor,
      },
    ]),
  );
}

export async function processScheduledNotification(
  db: RegistrationDatabase,
  notification: ScheduledNotification,
) {
  const registration = await db.getRegistrationById(notification.registration_id);
  if (!registration) {
    await db.markScheduledNotificationFailed(notification.id, "Registration not found");
    return { sent: false, error: "registration_not_found" };
  }

  try {
    const result = await sendAndRecordNotification({
      db,
      registration,
      channel: notification.channel,
      templateKey: notification.template_key,
      scheduledFor: notification.scheduled_for,
    });
    await db.markScheduledNotificationSent(notification.id);
    return result;
  } catch (error) {
    await db.markScheduledNotificationFailed(notification.id, errorMessage(error));
    return { sent: false, error: errorMessage(error) };
  }
}

function webinarDetailsFromRegistration(registration: SeminarRegistration): WebinarDetails {
  return {
    startAt: registration.webinar_start_at
      ? new Date(registration.webinar_start_at)
      : new Date(),
    dateLabel: registration.webinar_date_label || "the masterclass date",
    timeLabel: registration.webinar_time_label || "the masterclass time",
    joiningLink: registration.joining_link || "Joining link will be shared soon.",
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown notification error";
}
