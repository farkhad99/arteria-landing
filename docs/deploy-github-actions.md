# Deployment with GitHub Actions

Production uses a **single pipeline** in `.github/workflows/deploy-ec2.yml`: lint/build on GitHub-hosted runners, then deploy on your EC2 self-hosted runner (only if CI passes).

Full setup steps: **[github-self-hosted-runner.md](./github-self-hosted-runner.md)**

## Quick checklist

1. EC2 with Ubuntu + Docker
2. Run `scripts/setup-github-runner.sh` with a GitHub registration token
3. Add repository secrets (one per variable — see [github-secrets.md](./github-secrets.md))
4. Push to `main` or run **Deploy to EC2** manually

## Secrets

Individual GitHub secrets (not a single env file). See **[github-secrets.md](./github-secrets.md)** for the full list.

## Pipeline (`deploy-ec2.yml`)

| Job | Runner | When |
|-----|--------|------|
| **ci** — lint + build | `ubuntu-latest` | PRs, push to `main`, manual |
| **deploy** — Docker + migrate + restart | `self-hosted` (EC2) | After **ci** succeeds on `main` or manual dispatch (skipped on PRs) |

One workflow run per push — not two separate workflows.
