import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./supabase";
import type { MessageTemplateKey, NotificationChannel } from "./message-templates";
import { normalizeIndianMobile } from "./phone";

export type RegistrationStatus =
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "payment_dropped"
  | "cashfree_order_failed";

export type SeminarRegistration = {
  id: string;
  order_id: string;
  cf_order_id: string | null;
  payment_session_id: string | null;
  name: string;
  email: string;
  mobile: string;
  amount: number;
  currency: string;
  status: RegistrationStatus;
  cashfree_order_status: string | null;
  cashfree_payment_status: string | null;
  cf_payment_id: string | null;
  paid_at: string | null;
  webinar_start_at: string | null;
  webinar_date_label: string | null;
  webinar_time_label: string | null;
  joining_link: string | null;
  raw_create_order_response: unknown;
  raw_latest_webhook: unknown;
  last_error: string | null;
  reminders_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduledNotification = {
  id: string;
  registration_id: string;
  order_id: string;
  channel: NotificationChannel;
  template_key: MessageTemplateKey;
  recipient: string | null;
  scheduled_for: string;
  status: "queued" | "sent" | "failed" | "cancelled";
  attempts: number;
  last_error: string | null;
};

export type CreatePendingRegistrationInput = {
  orderId: string;
  name: string;
  email: string;
  mobile: string;
  amount: number;
  currency: string;
  webinarStartAt: Date;
  webinarDateLabel: string;
  webinarTimeLabel: string;
  joiningLink: string;
};

export type RecordOrderCreatedInput = {
  orderId: string;
  cfOrderId?: string | null;
  paymentSessionId: string;
  orderStatus?: string | null;
  rawResponse: unknown;
};

export type RecordInitiatedCashfreeOrderInput = CreatePendingRegistrationInput &
  RecordOrderCreatedInput;

export type RecordPaymentWebhookInput = {
  orderId: string;
  eventType: string;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  cfPaymentId?: string | null;
  status: RegistrationStatus;
  paidAt?: string | null;
  rawPayload: unknown;
};

export type NotificationLogInput = {
  registrationId?: string | null;
  orderId: string;
  channel: NotificationChannel;
  templateKey: MessageTemplateKey;
  recipient?: string | null;
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string | null;
  error?: string | null;
  scheduledFor?: Date | string | null;
  sentAt?: Date | string | null;
};

export type QueueScheduledNotificationInput = {
  registrationId: string;
  orderId: string;
  channel: NotificationChannel;
  templateKey: MessageTemplateKey;
  recipient?: string | null;
  scheduledFor: Date;
};

export type RegistrationDatabase = {
  createPendingRegistration(input: CreatePendingRegistrationInput): Promise<SeminarRegistration>;
  recordInitiatedCashfreeOrder(
    input: RecordInitiatedCashfreeOrderInput,
  ): Promise<SeminarRegistration>;
  recordOrderCreated(input: RecordOrderCreatedInput): Promise<SeminarRegistration>;
  markOrderCreationFailed(orderId: string, error: string): Promise<void>;
  getRegistrationByOrderId(orderId: string): Promise<SeminarRegistration | null>;
  recordPaymentWebhook(input: RecordPaymentWebhookInput): Promise<SeminarRegistration | null>;
  hasSentNotification(
    orderId: string,
    channel: NotificationChannel,
    templateKey: MessageTemplateKey,
  ): Promise<boolean>;
  recordNotificationLog(input: NotificationLogInput): Promise<void>;
  queueScheduledNotifications(input: QueueScheduledNotificationInput[]): Promise<void>;
  listDueScheduledNotifications(limit?: number): Promise<ScheduledNotification[]>;
  getRegistrationById(id: string): Promise<SeminarRegistration | null>;
  markScheduledNotificationSent(id: string): Promise<void>;
  markScheduledNotificationFailed(id: string, error: string): Promise<void>;
};

export function createRegistrationDatabase(
  supabase: SupabaseClient = createSupabaseAdminClient(),
): RegistrationDatabase {
  return {
    async createPendingRegistration(input) {
      const { data, error } = await supabase
        .from("seminar_registrations")
        .insert({
          order_id: input.orderId,
          name: input.name,
          email: input.email,
          mobile: normalizeRegistrationMobile(input.mobile),
          amount: input.amount,
          currency: input.currency,
          status: "pending_payment",
          webinar_start_at: input.webinarStartAt.toISOString(),
          webinar_date_label: input.webinarDateLabel,
          webinar_time_label: input.webinarTimeLabel,
          joining_link: input.joiningLink,
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizeRegistration(data);
    },

    async recordInitiatedCashfreeOrder(input) {
      const { data, error } = await supabase
        .from("seminar_registrations")
        .insert({
          order_id: input.orderId,
          cf_order_id: input.cfOrderId || null,
          payment_session_id: input.paymentSessionId,
          name: input.name,
          email: input.email,
          mobile: normalizeRegistrationMobile(input.mobile),
          amount: input.amount,
          currency: input.currency,
          status: "pending_payment",
          cashfree_order_status: input.orderStatus || null,
          webinar_start_at: input.webinarStartAt.toISOString(),
          webinar_date_label: input.webinarDateLabel,
          webinar_time_label: input.webinarTimeLabel,
          joining_link: input.joiningLink,
          raw_create_order_response: input.rawResponse,
          last_error: null,
        })
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizeRegistration(data);
    },

    async recordOrderCreated(input) {
      const { data, error } = await supabase
        .from("seminar_registrations")
        .update({
          cf_order_id: input.cfOrderId || null,
          payment_session_id: input.paymentSessionId,
          cashfree_order_status: input.orderStatus || null,
          raw_create_order_response: input.rawResponse,
          last_error: null,
        })
        .eq("order_id", input.orderId)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizeRegistration(data);
    },

    async markOrderCreationFailed(orderId, errorMessage) {
      const { error } = await supabase
        .from("seminar_registrations")
        .update({
          status: "cashfree_order_failed",
          last_error: errorMessage,
        })
        .eq("order_id", orderId);

      if (error) {
        throw new Error(error.message);
      }
    },

    async getRegistrationByOrderId(orderId) {
      const { data, error } = await supabase
        .from("seminar_registrations")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ? normalizeRegistration(data) : null;
    },

    async recordPaymentWebhook(input) {
      const registration = await this.getRegistrationByOrderId(input.orderId);

      const { error: eventError } = await supabase
        .from("cashfree_payment_events")
        .insert({
          registration_id: registration?.id || null,
          order_id: input.orderId,
          event_type: input.eventType,
          order_status: input.orderStatus || null,
          payment_status: input.paymentStatus || null,
          cf_payment_id: input.cfPaymentId || null,
          raw_payload: input.rawPayload,
        });

      if (eventError) {
        throw new Error(eventError.message);
      }

      if (!registration) {
        return null;
      }

      const { data, error } = await supabase
        .from("seminar_registrations")
        .update({
          status: input.status,
          cashfree_order_status: input.orderStatus || registration.cashfree_order_status,
          cashfree_payment_status: input.paymentStatus || registration.cashfree_payment_status,
          cf_payment_id: input.cfPaymentId || registration.cf_payment_id,
          paid_at: input.paidAt || registration.paid_at,
          raw_latest_webhook: input.rawPayload,
          last_error: null,
        })
        .eq("order_id", input.orderId)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizeRegistration(data);
    },

    async hasSentNotification(orderId, channel, templateKey) {
      const { count, error } = await supabase
        .from("notification_logs")
        .select("id", { count: "exact", head: true })
        .eq("order_id", orderId)
        .eq("channel", channel)
        .eq("template_key", templateKey)
        .eq("status", "sent");

      if (error) {
        throw new Error(error.message);
      }

      return Boolean(count);
    },

    async recordNotificationLog(input) {
      const { error } = await supabase.from("notification_logs").insert({
        registration_id: input.registrationId || null,
        order_id: input.orderId,
        channel: input.channel,
        template_key: input.templateKey,
        recipient: input.recipient || null,
        status: input.status,
        provider_message_id: input.providerMessageId || null,
        error: input.error || null,
        scheduled_for: toIsoOrNull(input.scheduledFor),
        sent_at: toIsoOrNull(input.sentAt),
      });

      if (error) {
        throw new Error(error.message);
      }
    },

    async queueScheduledNotifications(input) {
      if (!input.length) {
        return;
      }

      const { error } = await supabase
        .from("scheduled_notifications")
        .upsert(
          input.map((item) => ({
            registration_id: item.registrationId,
            order_id: item.orderId,
            channel: item.channel,
            template_key: item.templateKey,
            recipient: item.recipient || null,
            scheduled_for: item.scheduledFor.toISOString(),
            status: "queued",
          })),
          { onConflict: "registration_id,channel,template_key" },
        );

      if (error) {
        throw new Error(error.message);
      }

      const registrationId = input[0]?.registrationId;
      if (registrationId) {
        await supabase
          .from("seminar_registrations")
          .update({ reminders_scheduled_at: new Date().toISOString() })
          .eq("id", registrationId);
      }
    },

    async listDueScheduledNotifications(limit = 50) {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .eq("status", "queued")
        .lte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(normalizeScheduledNotification);
    },

    async getRegistrationById(id) {
      const { data, error } = await supabase
        .from("seminar_registrations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ? normalizeRegistration(data) : null;
    },

    async markScheduledNotificationSent(id) {
      const { data, error: readError } = await supabase
        .from("scheduled_notifications")
        .select("attempts")
        .eq("id", id)
        .single();

      if (readError) {
        throw new Error(readError.message);
      }

      const { error } = await supabase
        .from("scheduled_notifications")
        .update({
          status: "sent",
          attempts: Number(data?.attempts || 0) + 1,
          last_error: null,
          sent_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },

    async markScheduledNotificationFailed(id, errorMessage) {
      const { data, error: readError } = await supabase
        .from("scheduled_notifications")
        .select("attempts")
        .eq("id", id)
        .single();

      if (readError) {
        throw new Error(readError.message);
      }

      const { error } = await supabase
        .from("scheduled_notifications")
        .update({
          status: "failed",
          attempts: Number(data?.attempts || 0) + 1,
          last_error: errorMessage,
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
  };
}

function normalizeRegistrationMobile(mobile: string) {
  const normalized = normalizeIndianMobile(mobile);
  if (!normalized) {
    throw new Error("Mobile number must include a valid Indian mobile number");
  }
  return normalized;
}

function normalizeRegistration(value: unknown): SeminarRegistration {
  return value as SeminarRegistration;
}

function normalizeScheduledNotification(value: unknown): ScheduledNotification {
  return value as ScheduledNotification;
}

function toIsoOrNull(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}
