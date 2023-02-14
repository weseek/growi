#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18

# The node image includes a non-root user with sudo access. Use the
# "remoteUser" property in devcontainer.json to use it. On Linux, update
# these values to ensure the container user's UID/GID matches your local values.
# See https://aka.ms/vscode-remote/containers/non-root-user for details.
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN mkdir -p /workspace/growi/node_modules
RUN mkdir -p /workspace/growi/apps/app/node_modules
RUN mkdir -p /workspace/growi/apps/slackbot-proxy/node_modules
RUN mkdir -p /workspace/growi/apps/app/.next

# [Optional] Update UID/GID if needed
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
        groupmod --gid $USER_GID $USERNAME \
        && usermod --uid $USER_UID --gid $USER_GID $USERNAME; \
    fi
RUN chown -R $USER_UID:$USER_GID /home/$USERNAME /workspace;

# *************************************************************
# * Uncomment this section to use RUN instructions to install *
# * any needed dependencies after executing "apt-get update". *
# * See https://docs.docker.com/engine/reference/builder/#run *
# *************************************************************
ENV DEBIAN_FRONTEND=noninteractive

# Prepare to install Chrome for VRT
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

RUN apt-get update \
   && apt-get -y install --no-install-recommends git-lfs \
      # Chrome
      google-chrome-stable \
      # for Cypress
      libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb fonts-noto-cjk \
   # Clean up
   && apt-get autoremove -y \
   && apt-get clean -y \
   && rm -rf /var/lib/apt/lists/*
ENV DEBIAN_FRONTEND=dialog

# Uncomment to default to non-root user
# USER $USER_UID
