#!/usr/bin/env bash
set -euo pipefail

# Bootstrap a GitHub Actions self-hosted runner on Ubuntu EC2.
#
# 1. Create a registration token:
#    GitHub -> repo -> Settings -> Actions -> Runners -> New self-hosted runner
# 2. Run on EC2 (as ubuntu or your deploy user):
#    curl -fsSL https://raw.githubusercontent.com/.../setup-github-runner.sh | bash
#    Or copy this file to the server and run:
#    sudo RUNNER_USER=ubuntu GITHUB_REPO=farkhad99/arteria-landing GITHUB_RUNNER_TOKEN=<token> ./setup-github-runner.sh
#
# Required env:
#   GITHUB_REPO          owner/repo (default: farkhad99/arteria-landing)
#   GITHUB_RUNNER_TOKEN  one-time token from GitHub runner setup page
#
# Optional env:
#   RUNNER_USER          Linux user that runs jobs (default: ubuntu)
#   RUNNER_NAME          Runner name in GitHub UI (default: arteria-ec2)
#   RUNNER_LABELS        Comma-separated labels (default: arteria-landing,linux)
#   RUNNER_DIR           Install path (default: /home/ubuntu/actions-runner)

GITHUB_REPO="${GITHUB_REPO:-farkhad99/arteria-landing}"
RUNNER_USER="${RUNNER_USER:-ubuntu}"
RUNNER_NAME="${RUNNER_NAME:-arteria-ec2}"
RUNNER_LABELS="${RUNNER_LABELS:-arteria-landing,linux}"
RUNNER_DIR="${RUNNER_DIR:-/home/${RUNNER_USER}/actions-runner}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

if [[ -z "${GITHUB_RUNNER_TOKEN:-}" ]]; then
  echo "GITHUB_RUNNER_TOKEN is required."
  echo "Get it from: https://github.com/${GITHUB_REPO}/settings/actions/runners/new"
  exit 1
fi

echo "==> Installing Docker and dependencies"
apt-get update -qq
apt-get install -y -qq docker.io curl ca-certificates jq
systemctl enable docker
systemctl start docker
usermod -aG docker "${RUNNER_USER}"

echo "==> Downloading latest Actions runner"
RUNNER_VERSION="$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/^v//')"
ARCH="x64"
RUNNER_PKG="actions-runner-linux-${ARCH}-${RUNNER_VERSION}.tar.gz"
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_PKG}"

install -d -o "${RUNNER_USER}" -g "${RUNNER_USER}" "${RUNNER_DIR}"
cd "${RUNNER_DIR}"

if [[ ! -f ./config.sh ]]; then
  sudo -u "${RUNNER_USER}" curl -fsSL -o "${RUNNER_PKG}" "${RUNNER_URL}"
  sudo -u "${RUNNER_USER}" tar xzf "${RUNNER_PKG}"
  rm -f "${RUNNER_PKG}"
fi

echo "==> Configuring runner for ${GITHUB_REPO}"
sudo -u "${RUNNER_USER}" ./config.sh \
  --url "https://github.com/${GITHUB_REPO}" \
  --token "${GITHUB_RUNNER_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${RUNNER_LABELS}" \
  --unattended \
  --replace

echo "==> Ensuring runner can run docker"
if ! sudo -u "${RUNNER_USER}" docker ps >/dev/null 2>&1; then
  echo "Docker not usable by ${RUNNER_USER}. Fixing group membership..."
  usermod -aG docker "${RUNNER_USER}"
fi

# Runner service uses a minimal PATH; include standard locations
RUNNER_ENV="${RUNNER_DIR}/.env"
touch "${RUNNER_ENV}"
chown "${RUNNER_USER}:${RUNNER_USER}" "${RUNNER_ENV}"
if ! grep -q '^PATH=' "${RUNNER_ENV}" 2>/dev/null; then
  echo 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' >> "${RUNNER_ENV}"
fi

echo "==> Installing systemd service"
./svc.sh install "${RUNNER_USER}"
./svc.sh stop || true
./svc.sh start
./svc.sh status

sudo -u "${RUNNER_USER}" docker ps >/dev/null
echo "Docker OK for ${RUNNER_USER}"

echo ""
echo "Runner installed. In GitHub, confirm it shows as Idle."
echo "Push to main will run: .github/workflows/deploy-ec2.yml"
