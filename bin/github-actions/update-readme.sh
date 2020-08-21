#!/bin/sh

cd docker

sed -i -e "s/^\([*] \[\`\)[^\`]\+\(\`, \`4\.1\`, .\+\]\)\(.\+\/blob\/v\).\+\(\/docker\/Dockerfile.\+\)$/\1${RELEASE_VERSION}\2\3${RELEASE_VERSION}\4/" README.md
sed -i -e "s/^\([*] \[\`\)[^\`]\+\(\`, \`4\.1-nocdn\`, .\+\]\)\(.\+\/blob\/v\).\+\(\/docker\/Dockerfile.\+\)$/\1${RELEASE_VERSION}-nocdn\2\3${RELEASE_VERSION}\4/" README.md
