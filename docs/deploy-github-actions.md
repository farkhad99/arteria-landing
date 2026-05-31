# Deployment with GitHub Actions

Production deploys use a **self-hosted runner on your AWS EC2** instance. Pushes to `main` run `.github/workflows/deploy-ec2.yml` on that machine.

Full setup steps: **[github-self-hosted-runner.md](./github-self-hosted-runner.md)**

## Quick checklist

1. EC2 with Ubuntu + Docker
2. Run `scripts/setup-github-runner.sh` with a GitHub registration token
3. Add repository secrets (one per variable — see [github-secrets.md](./github-secrets.md))
4. Push to `main` or run **Deploy to EC2** manually

## Secrets

Individual GitHub secrets (not a single env file). See **[github-secrets.md](./github-secrets.md)** for the full list.

## Workflows

| File | Runner | When |
|------|--------|------|
| `ci.yml` | GitHub-hosted | PRs and pushes (lint + build) |
| `deploy-ec2.yml` | Self-hosted (`arteria-landing`) | Push to `main`, manual dispatch |
