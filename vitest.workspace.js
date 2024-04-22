import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./apps/app/vitest.config.ts",
  "./apps/app/vitest.config.integ.ts",
  "./apps/app/vitest.config.components.ts",
  "./apps/app/test-with-vite/download-mongo-binary/vitest.config.ts",
  "./packages/pluginkit/vitest.config.ts",
  "./packages/preset-templates/vitest.config.ts",
  "./packages/slack/vitest.config.ts",
  "./packages/remark-lsx/vitest.config.ts",
  "./packages/remark-drawio/vite.config.ts",
  "./packages/ui/vite.config.ts",
  "./packages/preset-themes/vite.libs.config.ts",
  "./packages/preset-themes/vite.themes.config.ts",
  "./packages/core/vitest.config.ts",
  "./packages/presentation/vite.config.ts",
  "./packages/editor/vite.config.ts",
  "./packages/remark-attachment-refs/vite.server.config.ts",
  "./packages/remark-attachment-refs/vite.client.config.ts"
])
