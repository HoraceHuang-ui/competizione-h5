<script setup lang="ts">
import '@mdui/icons/home--rounded.js'
import { useRouter } from 'vue-router'
import SiteBeian from '@/components/SiteBeian.vue'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'status' })
}
</script>

<template>
  <div class="min-h-full w-full flex flex-col">
    <div
      class="flex-1 w-full flex flex-col justify-center items-center text-center px-4 pb-10"
    >
      <div
        class="font-bold text-8xl md:text-9xl select-text"
        style="color: rgb(var(--mdui-color-primary))"
      >
        404
      </div>
      <p class="mt-4 text-lg md:text-xl opacity-80">
        {{ $t('notFound.pageNotFound') }}
      </p>
      <mdui-button variant="filled" class="mt-8" @click="goHome">
        <mdui-icon-home--rounded slot="icon"></mdui-icon-home--rounded>
        {{ $t('notFound.backHome') }}
      </mdui-button>
    </div>

    <div class="sticky bottom-0 w-full flex justify-center mb-2">
      <SiteBeian class="w-full max-w-[1200px] px-2 pt-3" />
    </div>
  </div>
</template>
