sudo chown -R vscode:vscode /workspace;

# Instal additional packages
sudo apt update
sudo apt-get install -y --no-install-recommends \
  chromium-browser locales fonts-ipafont fonts-ipaexfont fonts-ipafont-gothic fonts-ipafont-mincho
sudo apt-get clean -y

# Setup pnpm
SHELL=bash pnpm setup
eval "$(cat /home/vscode/.bashrc)"

# Install turbo
pnpm install turbo --global

# Install dependencies
turbo run bootstrap
