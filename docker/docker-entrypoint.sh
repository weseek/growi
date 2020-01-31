#!/bin/sh

set -e

# Support `FILE_UPLOAD=local`
mkdir -p /data/uploads
if [ ! -e "$appDir/public/uploads" ]; then
  ln -s /data/uploads $appDir/public/uploads
fi

chown -R node:node /data/uploads
chown -h node:node $appDir/public/uploads

su-exec node $@
