#!/bin/sh

set -e

# Corresponds to `FILE_UPLOAD=local`
mkdir -p /data/uploads
if [ ! -e "$APP_DIR/public/uploads" ]; then
  ln -s /data/uploads $APP_DIR/public/uploads
fi
