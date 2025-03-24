# prevent file not found error on docker compose up
if [ ! -f ".devcontainer/compose.extend.yml" ]; then
  touch .devcontainer/compose.extend.yml
fi
