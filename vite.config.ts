import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { cloudflare } from '@cloudflare/vite-plugin'

import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vueDevTools(),
    cloudflare(),
    Components(),
    tailwindcss(),
    vue({
      template: {
        compilerOptions: {
          // 所有以 mdui- 开头的标签名都是 mdui 组件
          isCustomElement: tag => tag.startsWith('mdui-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/ai': {
        target:
          'https://api.cloudflare.com/client/v4/accounts/b666bcb97b0bdc3983313c378229ce79/ai/run/@cf/openai/gpt-oss-120b',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ai/, ''),
      },
    },
  },
})
