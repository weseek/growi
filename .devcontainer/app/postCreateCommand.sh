sudo chown -R vscode:vscode /workspace;

# Instal additional packages
sudo apt update
sudo apt-get install -y --no-install-recommends \
  iputils-ping net-tools dnsutils
sudo apt-get clean -y

# Set permissions for shared directory for bulk export
mkdir -p /tmp/page-bulk-export
sudo chown -R vscode:vscode /tmp/page-bulk-export
sudo chmod 700 /tmp/page-bulk-export

# Setup pnpm
SHELL=bash pnpm setup
eval "$(cat /home/vscode/.bashrc)"

# Install turbo
pnpm install turbo --global

# Install dependencies
turbo run bootstrap
