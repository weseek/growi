// vite.config.ts
import react from "file:///workspace/growi/node_modules/.pnpm/@vitejs+plugin-react@4.3.1_vite@5.4.17_@types+node@20.14.0_sass@1.77.6_terser@5.39.0_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nodeExternals } from "file:///workspace/growi/node_modules/.pnpm/rollup-plugin-node-externals@6.1.1_rollup@4.39.0/node_modules/rollup-plugin-node-externals/dist/index.js";
import { defineConfig } from "file:///workspace/growi/node_modules/.pnpm/vite@5.4.17_@types+node@20.14.0_sass@1.77.6_terser@5.39.0/node_modules/vite/dist/node/index.js";
import dts from "file:///workspace/growi/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.14.0_rollup@4.39.0_typescript@5.0.4_vite@5.4.17_@t_8d4980294d9f3440913f1180954f6f8c/node_modules/vite-plugin-dts/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      copyDtsFiles: true
    }),
    {
      ...nodeExternals({
        devDeps: true,
        builtinsPrefix: "ignore"
      }),
      enforce: "pre"
    }
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: {
        index: "src/index.ts"
      },
      name: "remark-drawio-libs",
      formats: ["es"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvd29ya3NwYWNlL2dyb3dpL3BhY2thZ2VzL3JlbWFyay1kcmF3aW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi93b3Jrc3BhY2UvZ3Jvd2kvcGFja2FnZXMvcmVtYXJrLWRyYXdpby92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vd29ya3NwYWNlL2dyb3dpL3BhY2thZ2VzL3JlbWFyay1kcmF3aW8vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgbm9kZUV4dGVybmFscyB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tbm9kZS1leHRlcm5hbHMnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBkdHMoe1xuICAgICAgY29weUR0c0ZpbGVzOiB0cnVlLFxuICAgIH0pLFxuICAgIHtcbiAgICAgIC4uLm5vZGVFeHRlcm5hbHMoe1xuICAgICAgICBkZXZEZXBzOiB0cnVlLFxuICAgICAgICBidWlsdGluc1ByZWZpeDogJ2lnbm9yZScsXG4gICAgICB9KSxcbiAgICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIH0sXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHtcbiAgICAgICAgaW5kZXg6ICdzcmMvaW5kZXgudHMnLFxuICAgICAgfSxcbiAgICAgIG5hbWU6ICdyZW1hcmstZHJhd2lvLWxpYnMnLFxuICAgICAgZm9ybWF0czogWydlcyddLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVMsT0FBTyxXQUFXO0FBQ3pULFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUdoQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsTUFDRixjQUFjO0FBQUEsSUFDaEIsQ0FBQztBQUFBLElBQ0Q7QUFBQSxNQUNFLEdBQUcsY0FBYztBQUFBLFFBQ2YsU0FBUztBQUFBLFFBQ1QsZ0JBQWdCO0FBQUEsTUFDbEIsQ0FBQztBQUFBLE1BQ0QsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsTUFDSCxPQUFPO0FBQUEsUUFDTCxPQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0EsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLElBQUk7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
