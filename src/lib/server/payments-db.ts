import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type EmailStatus =
  | "pending"
  | "sent"
  | "failed"
  | "missing_email"
  | "not_required";

export type PaymentRecord = {
  id: number;
  event_type: string;
  order_id: string;
  transaction_id: string | null;
  order_status: string;
  order_amount: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  form_id: string | null;
  raw_payload: string;
  email_status: EmailStatus;
  email_attempts: number;
  last_email_error: string | null;
  created_at: string;
  updated_at: string;
  emailed_at: string | null;
};

export type PaymentEventInput = {
  eventType: string;
  orderId: string;
  transactionId?: string | number | null;
  orderStatus: string;
  orderAmount?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  formId?: string | null;
  rawPayload: string;
};

export type EmailAttemptInput = {
  orderId: string;
  recipientEmail?: string | null;
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string | null;
  error?: string | null;
};

const DEFAULT_DATABASE_PATH = path.join(process.cwd(), "data", "app.sqlite");

export function getDatabasePath() {
  return process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH;
}

export function createPaymentDatabase(dbPath = getDatabasePath()) {
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initializeSchema(db);

  return {
    upsertPaymentEvent(input: PaymentEventInput) {
      db.prepare(
        `
        INSERT INTO payment_form_orders (
          event_type,
          order_id,
          transaction_id,
          order_status,
          order_amount,
          customer_name,
          customer_email,
          customer_phone,
          form_id,
          raw_payload,
          email_status,
          created_at,
          updated_at
        )
        VALUES (
          @eventType,
          @orderId,
          @transactionId,
          @orderStatus,
          @orderAmount,
          @customerName,
          @customerEmail,
          @customerPhone,
          @formId,
          @rawPayload,
          'pending',
          datetime('now'),
          datetime('now')
        )
        ON CONFLICT(order_id) DO UPDATE SET
          event_type = excluded.event_type,
          transaction_id = excluded.transaction_id,
          order_status = excluded.order_status,
          order_amount = excluded.order_amount,
          customer_name = excluded.customer_name,
          customer_email = excluded.customer_email,
          customer_phone = excluded.customer_phone,
          form_id = excluded.form_id,
          raw_payload = excluded.raw_payload,
          updated_at = datetime('now')
        `,
      ).run({
        ...input,
        transactionId:
          input.transactionId === undefined || input.transactionId === null
            ? null
            : String(input.transactionId),
      });

      return this.getPaymentByOrderId(input.orderId);
    },

    getPaymentByOrderId(orderId: string) {
      return db
        .prepare("SELECT * FROM payment_form_orders WHERE order_id = ?")
        .get(orderId) as PaymentRecord | undefined;
    },

    markEmailSent(orderId: string, recipientEmail: string, messageId?: string | null) {
      db.prepare(
        `
        UPDATE payment_form_orders
        SET email_status = 'sent',
            email_attempts = email_attempts + 1,
            last_email_error = NULL,
            emailed_at = datetime('now'),
            updated_at = datetime('now')
        WHERE order_id = ?
        `,
      ).run(orderId);

      this.recordEmailAttempt({
        orderId,
        recipientEmail,
        status: "sent",
        providerMessageId: messageId || null,
      });
    },

    markEmailFailed(orderId: string, recipientEmail: string | null, error: string) {
      db.prepare(
        `
        UPDATE payment_form_orders
        SET email_status = 'failed',
            email_attempts = email_attempts + 1,
            last_email_error = ?,
            updated_at = datetime('now')
        WHERE order_id = ?
        `,
      ).run(error, orderId);

      this.recordEmailAttempt({
        orderId,
        recipientEmail,
        status: "failed",
        error,
      });
    },

    markEmailMissing(orderId: string) {
      db.prepare(
        `
        UPDATE payment_form_orders
        SET email_status = 'missing_email',
            last_email_error = 'Missing customer email in Cashfree payload',
            updated_at = datetime('now')
        WHERE order_id = ?
        `,
      ).run(orderId);

      this.recordEmailAttempt({
        orderId,
        status: "skipped",
        error: "Missing customer email in Cashfree payload",
      });
    },

    markEmailNotRequired(orderId: string) {
      db.prepare(
        `
        UPDATE payment_form_orders
        SET email_status = 'not_required',
            updated_at = datetime('now')
        WHERE order_id = ?
        `,
      ).run(orderId);
    },

    recordEmailAttempt(input: EmailAttemptInput) {
      db.prepare(
        `
        INSERT INTO email_send_attempts (
          order_id,
          recipient_email,
          status,
          provider_message_id,
          error,
          created_at
        )
        VALUES (@orderId, @recipientEmail, @status, @providerMessageId, @error, datetime('now'))
        `,
      ).run({
        orderId: input.orderId,
        recipientEmail: input.recipientEmail || null,
        status: input.status,
        providerMessageId: input.providerMessageId || null,
        error: input.error || null,
      });
    },

    close() {
      db.close();
    },
  };
}

export type PaymentDatabase = ReturnType<typeof createPaymentDatabase>;

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_form_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      order_id TEXT NOT NULL UNIQUE,
      transaction_id TEXT,
      order_status TEXT NOT NULL,
      order_amount REAL,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      form_id TEXT,
      raw_payload TEXT NOT NULL,
      email_status TEXT NOT NULL DEFAULT 'pending',
      email_attempts INTEGER NOT NULL DEFAULT 0,
      last_email_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      emailed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS email_send_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      recipient_email TEXT,
      status TEXT NOT NULL,
      provider_message_id TEXT,
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(order_id) REFERENCES payment_form_orders(order_id)
    );

    CREATE INDEX IF NOT EXISTS idx_payment_form_orders_status
      ON payment_form_orders(order_status);

    CREATE INDEX IF NOT EXISTS idx_email_send_attempts_order_id
      ON email_send_attempts(order_id);
  `);
}
