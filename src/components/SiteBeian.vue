<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import { openLink } from '@/utils/utils'

const isMobile = inject('isMobile') as ComputedRef<boolean>
</script>

<template>
  <div class="w-full">
    <div
      class="justify-center items-center flex flex-row w-full text-[rgb(var(--mdui-color-outline))] text-sm"
      v-if="!isMobile"
    >
      <img
        src="@/assets/archiveIcon.png"
        class="inline-block w-4 h-4.25 mr-2"
      />
      <div
        class="cursor-pointer"
        @click="
          openLink(
            'https://beian.mps.gov.cn/#/query/webSearch?code=33010202005351',
          )
        "
      >
        浙公网安备33010202005351号
      </div>

      <div
        class="cursor-pointer ml-4"
        @click="openLink('https://beian.miit.gov.cn/')"
      >
        浙ICP备2025209586号-1
      </div>
    </div>

    <div
      class="mb-4 justify-center items-center flex flex-col w-full text-[rgb(var(--mdui-color-outline))] text-sm"
      v-else
    >
      <div class="flex flex-row">
        <img
          src="@/assets/archiveIcon.png"
          class="inline-block w-4 h-4.25 mr-2"
        />
        <div
          class="cursor-pointer"
          @click="
            openLink(
              'https://beian.mps.gov.cn/#/query/webSearch?code=33010202005351',
            )
          "
        >
          浙公网安备33010202005351号
        </div>
      </div>

      <div
        class="cursor-pointer ml-4"
        @click="openLink('https://beian.miit.gov.cn/')"
      >
        浙ICP备2025209586号-1
      </div>
    </div>
  </div>
</template>
