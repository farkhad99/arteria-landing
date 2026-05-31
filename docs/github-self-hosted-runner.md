# GitHub self-hosted runner on AWS EC2

Deploy runs **on your EC2 machine** via a GitHub Actions self-hosted runner. On every push to `main`, the workflow checks out code on the server, builds Docker, runs migrations, and restarts the app — no SSH or rsync from GitHub-hosted runners.

## Architecture

```mermaid
flowchart LR
  push[Push to main] --> gh[GitHub Actions]
  gh --> runner[Self-hosted runner on EC2]
  runner --> docker[Docker build + migrate]
  docker --> app[arteria-landing :3000]
```

## 1) EC2 prerequisites

- Ubuntu 22.04 or 24.04
- Security group: inbound `22` (SSH), `80`/`443` if using Nginx, `3000` only if you expose the app directly
- Instance profile or IAM user keys for S3 (same as `.env.example`)

SSH into the server:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 2) Install the runner (one time)

On the EC2 instance:

```bash
# Copy script from your machine, or clone the repo once:
git clone https://github.com/farkhad99/arteria-landing.git
cd arteria-landing
```

Get a **registration token** (valid ~1 hour):

1. Open [Actions → Runners](https://github.com/farkhad99/arteria-landing/settings/actions/runners)
2. Click **New self-hosted runner**
3. Choose **Linux** and copy the token from the configure command

Run the bootstrap script:

```bash
sudo GITHUB_RUNNER_TOKEN=<paste-token-here> ./scripts/setup-github-runner.sh
```

Log out and back in (or reboot) so the `ubuntu` user’s `docker` group membership applies.

Verify in GitHub: the runner should appear as **Idle** with labels `arteria-landing` and `linux`.

## 3) GitHub secrets

Add each credential as its own repository secret (not a single env file). Full list: **[github-secrets.md](./github-secrets.md)**.

Minimum required: `WEBSITE_URL`, `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, AWS vars, and Telegram vars. See [github-secrets.md](./github-secrets.md).

## 4) Trigger deploy

- **Automatic:** push or merge to `main` (runs **CI and Deploy** pipeline)
- **Manual:** Actions → **CI and Deploy** → **Run workflow**

Deploy job uses:

```yaml
runs-on: self-hosted
```

If deploy stays on **“Waiting for a runner”**, check **Settings → Actions → Runners**: status must be **Idle** (not Offline), and the runner must be registered on **this repository** (not only another org/repo).

## 5) Verify

On EC2:

```bash
docker ps
curl -I http://127.0.0.1:3000
```

In the browser: `http://<EC2_IP>:3000` or your domain behind Nginx.

Admin: `/admin` (password from `ADMIN_PASSWORD`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Job queued, never starts | Runner **Offline** or **wrong labels** — use `runs-on: self-hosted` in workflow; `sudo ./svc.sh restart` on EC2 |
| Waiting for a runner… | Runner offline, wrong repo, or missing label `arteria-landing` — simplify to `runs-on: self-hosted` or add labels on the runner in GitHub |
| `docker: command not found` (exit 127) | Install Docker on EC2 and restart the runner (see below) |

### Fix: `docker: command not found`

On EC2:

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

# Restart runner so the docker group applies
cd /home/ubuntu/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh start

# Must succeed:
sudo -u ubuntu docker ps
```

Then re-run **CI and Deploy** in GitHub Actions.
| `permission denied` on Docker | `sudo usermod -aG docker ubuntu`, re-login, restart runner service |
| `Missing required secret/env` | Add the named secret in GitHub repo settings (see github-secrets.md) |
| Build fails on DB | Ensure `DATABASE_URL` is reachable from EC2 (RDS security group allows EC2 SG on port 5432) |
| Re-register runner | New token from GitHub → run `setup-github-runner.sh` again (`--replace` is set) |

## Optional: Nginx + HTTPS

Terminate TLS on Nginx and proxy to `127.0.0.1:3000`. Do not expose port 3000 publicly if Nginx handles `443`.

## Pull requests

PRs run only the **ci** job (lint + build). **deploy** is skipped until merge to `main`.
