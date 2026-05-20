import { createHmac, timingSafeEqual } from "node:crypto";

type VerifyCashfreeWebhookSignatureInput = {
  timestamp?: string | null;
  rawBody: string;
  signature?: string | null;
  secret?: string | null;
};

export function verifyCashfreeWebhookSignature({
  timestamp,
  rawBody,
  signature,
  secret,
}: VerifyCashfreeWebhookSignatureInput) {
  if (!timestamp || !signature || !secret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
