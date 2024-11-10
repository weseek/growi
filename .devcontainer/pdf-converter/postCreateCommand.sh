# Instal additional packages
sudo apt update
sudo apt-get install -y --no-install-recommends \
  chromium locales fonts-ipafont fonts-ipaexfont fonts-ipafont-gothic fonts-ipafont-mincho
sudo apt-get clean -y

# Setup pnpm
SHELL=bash pnpm setup
eval "$(cat /home/node/.bashrc)"
# Update pnpm
pnpm i -g pnpm

# Install turbo
pnpm install turbo --global

# Install dependencies
turbo run bootstrap
