# Deployment with GitHub Actions

Production uses a **single pipeline** in `.github/workflows/deploy-ec2.yml`: lint/build on GitHub-hosted runners, then deploy on your EC2 self-hosted runner (only if CI passes). Secrets go straight from GitHub into `docker run` — no `.env` file step.

Full setup steps: **[github-self-hosted-runner.md](./github-self-hosted-runner.md)**

## Quick checklist

1. EC2 with Ubuntu + Docker + GitHub self-hosted runner (see [github-self-hosted-runner.md](./github-self-hosted-runner.md))
2. Add repository secrets (one per variable — see [github-secrets.md](./github-secrets.md))
3. Push to `main` or run **CI and Deploy** manually

## Secrets

Individual GitHub secrets (not a single env file). See **[github-secrets.md](./github-secrets.md)** for the full list.

## Pipeline (`deploy-ec2.yml`)

| Job | Runner | When |
|-----|--------|------|
| **ci** — lint + build | `ubuntu-latest` | PRs, push to `main`, manual |
| **deploy** — Docker + migrate + restart | `self-hosted` (EC2) | After **ci** succeeds on `main` or manual dispatch (skipped on PRs) |

One workflow run per push — not two separate workflows.
