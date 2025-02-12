# Instal additional packages
sudo apt update
sudo apt-get install -y --no-install-recommends \
  chromium fonts-lato fonts-ipafont-gothic fonts-noto-cjk
sudo apt-get clean -y

# Setup pnpm
SHELL=bash pnpm setup
eval "$(cat /home/node/.bashrc)"
# Update pnpm
pnpm i -g pnpm@9.4.0

# Install turbo
pnpm install turbo --global

# Install dependencies
turbo run bootstrap
