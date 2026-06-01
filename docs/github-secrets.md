# GitHub Actions secrets

Production credentials live in **GitHub repository secrets** — not in a committed `.env` file. The deploy job passes them from the runner environment into Docker with `docker run -e VAR` (no `.env` file on disk).

Add secrets at: **Settings → Secrets and variables → Actions → New repository secret**

## Required secrets

| Secret                  | Used for                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WEBSITE_URL`           | Canonical site URL (sitemap), e.g. `https://thearteria.com`                                                                                                   |
| `DATABASE_URL`          | PostgreSQL for Prisma — value must be **only** the URL, e.g. `postgresql://user:pass@host:5432/postgres?schema=public` (no `DATABASE_URL=` prefix, no quotes) |
| `ADMIN_PASSWORD`        | `/admin` login                                                                                                                                                |
| `ADMIN_SESSION_SECRET`  | Admin session cookie signing (long random string)                                                                                                             |
| `AWS_REGION`            | S3 region, e.g. `eu-central-1`                                                                                                                                |
| `AWS_ACCESS_KEY_ID`     | S3 uploads (admin media)                                                                                                                                      |
| `AWS_SECRET_ACCESS_KEY` | S3 uploads                                                                                                                                                    |
| `AWS_S3_BUCKET`         | Bucket name                                                                                                                                                   |
| `TELEGRAM_BOT_TOKEN`    | Contact form notifications                                                                                                                                    |
| `TELEGRAM_CHAT_ID`      | Telegram chat/channel ID                                                                                                                                      |

## Optional secrets

| Secret                              | Used for |
| ----------------------------------- | -------- |
| `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` | GTM      |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS`      | GA       |

## Not used (self-hosted stack)

This deployment does **not** use Contentful, Slack, or HubSpot. Projects come from Postgres; contact notifications go to Telegram.

## Local development

Copy `.env.example` to `.env.local`. That file is gitignored.

## Runner setup

See [github-self-hosted-runner.md](./github-self-hosted-runner.md).
