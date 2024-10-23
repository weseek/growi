# USAGE:
#   cd apps/app && sh bin/openapi/swagger-jsdoc-apiv3.sh
#   APP_PATH=/path/to/apps/app sh bin/openapi/swagger-jsdoc-apiv3.sh
#   APP_PATH=/path/to/apps/app OUT=/path/to/output sh bin/openapi/swagger-jsdoc-apiv3.sh

APP_PATH=${APP_PATH:-"."}

OUT=${OUT:-"${APP_PATH}/tmp/swagger-apiv3.json"}

swagger-jsdoc \
  -o "${OUT}" \
  -d "${APP_PATH}/bin/openapi/swagger-definition-apiv3.js" \
  "${APP_PATH}/src/server/routes/apiv3/**/*.{js,ts}" \
  "${APP_PATH}/src/server/models/openapi/**/*.{js,ts}"
