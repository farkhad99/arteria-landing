#!/usr/bin/env bash
# Build .env.production from environment variables (GitHub Actions secrets).
set -euo pipefail

OUT_FILE="${1:-.env.production}"

require_var() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "Missing required secret/env: $name"
    exit 1
  fi
}

escape_env_value() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  printf '%s' "$value"
}

write_kv() {
  local key="$1"
  local value="${2:-}"
  if [[ -n "$value" ]]; then
    printf '%s="%s"\n' "$key" "$(escape_env_value "$value")" >> "$OUT_FILE"
  fi
}

require_var DATABASE_URL
require_var ADMIN_PASSWORD
require_var ADMIN_SESSION_SECRET
require_var AWS_REGION
require_var AWS_ACCESS_KEY_ID
require_var AWS_SECRET_ACCESS_KEY
require_var AWS_S3_BUCKET
require_var TELEGRAM_BOT_TOKEN
require_var TELEGRAM_CHAT_ID
require_var WEBSITE_URL

: > "$OUT_FILE"

write_kv NODE_ENV production
write_kv WEBSITE_URL "$WEBSITE_URL"
write_kv DATABASE_URL "$DATABASE_URL"
write_kv ADMIN_PASSWORD "$ADMIN_PASSWORD"
write_kv ADMIN_SESSION_SECRET "$ADMIN_SESSION_SECRET"
write_kv AWS_REGION "$AWS_REGION"
write_kv AWS_ACCESS_KEY_ID "$AWS_ACCESS_KEY_ID"
write_kv AWS_SECRET_ACCESS_KEY "$AWS_SECRET_ACCESS_KEY"
write_kv AWS_S3_BUCKET "$AWS_S3_BUCKET"
write_kv TELEGRAM_BOT_TOKEN "$TELEGRAM_BOT_TOKEN"
write_kv TELEGRAM_CHAT_ID "$TELEGRAM_CHAT_ID"

# Optional analytics
write_kv NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID "${NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID:-}"
write_kv NEXT_PUBLIC_GOOGLE_ANALYTICS "${NEXT_PUBLIC_GOOGLE_ANALYTICS:-}"

echo "Wrote $OUT_FILE ($(wc -l < "$OUT_FILE" | tr -d ' ') keys, values not printed)"
