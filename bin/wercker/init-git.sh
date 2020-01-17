#!/bin/sh

git config --global user.name "wercker"
git config --global user.email "info@weseek.co.jp"

# reconfigure origin
GITHUB_ORIGIN=https://yuki-takei:$GITHUB_TOKEN@$WERCKER_GIT_DOMAIN/$WERCKER_GIT_OWNER/$WERCKER_GIT_REPOSITORY.git
git remote rm origin
git remote add origin $GITHUB_ORIGIN
