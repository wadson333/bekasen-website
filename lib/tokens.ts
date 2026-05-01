/**
 * Token generation utilities for client_projects.access_token and similar
 * unguessable URL keys.
 */
import { randomBytes } from "node:crypto";

export function generateClientAccessToken(): string {
  // 32 bytes = 256 bits = 64 hex chars per spec section 8.1
  return randomBytes(32).toString("hex");
}
