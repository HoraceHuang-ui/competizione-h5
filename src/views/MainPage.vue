<script setup lang="ts">
import { inject, onMounted, ref, type Ref } from 'vue'
import '@mdui/icons/check-circle--rounded.js'
import '@mdui/icons/error--rounded.js'
import '@mdui/icons/refresh--rounded.js'
import { useStore } from '@/store'
import { launchSteam, openLink } from '@/utils/utils.ts'

const store = useStore()

const loading = ref(false)
const status = ref<any>({})
const launching = ref(false)

const { isDark } = inject('isDark') as {
  isDark: Ref<boolean>
  setDark: (val: boolean) => void
}

const launchGame = () => {
  launching.value = true
  launchSteam('805550')
  setTimeout(() => {
    launching.value = false
  }, 3000)
}

const queryData = () => {
  loading.value = true
  fetch('https://acc-status.jonatan.net/api/v2/acc/status', {
    method: 'GET',
  })
    .then(resp => resp.json())
    .catch(() => {
      status.value = undefined
      loading.value = false
    })
    .then(data => {
      status.value = data
      sessionStorage.serverDown = !status.value?.status
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  queryData()
})
</script>

<template>
  <div
    class="size-full flex flex-col justify-center items-center pb-8 relative"
  >
    <Transition name="fade" mode="out-in">
      <div class="loading-spinner" v-if="loading">
        <mdui-circular-progress></mdui-circular-progress>
      </div>
      <div v-else>
        <mdui-tooltip placement="bottom">
          <div slot="content">
            <span
              >{{ $t('status.apiFrom') }}
              <a href="https://acc-status.jonatan.net"
                >acc-status.jonatan.net</a
              ></span
            >
          </div>
          <div>
            <div class="flex flex-row justify-center">
              <div
                class="rounded-full px-1 py-0.5 border border-gray-400 mb-3 flex flex-row justify-center items-center"
              >
                <mdui-icon-check-circle--rounded
                  v-if="status?.status === 1"
                  class="text-green-500 dark:text-green-400"
                ></mdui-icon-check-circle--rounded>
                <mdui-icon-error--rounded
                  v-else
                  class="text-red-500 dark:text-red-400"
                ></mdui-icon-error--rounded>
                <div class="mx-2 mt-0.5">
                  {{
                    status?.status == 1
                      ? $t('status.badNews')
                      : $t('status.goodNews')
                  }}
                </div>
              </div>
            </div>
            <div class="title mb-1 font-bold text-3xl relative">
              {{
                status?.status !== undefined
                  ? status?.status === 1
                    ? $t('status.serverUp')
                    : $t('status.serverDown')
                  : $t('status.apiDown')
              }}
              <mdui-button-icon
                style="color: rgb(var(--mdui-color-primary))"
                class="absolute -right-10 -top-1"
                @click="queryData"
              >
                <mdui-icon-refresh--rounded></mdui-icon-refresh--rounded>
              </mdui-button-icon>
            </div>
            <div v-if="!status?.status" class="opacity-70 text-center mb-3">
              {{ store.settings.status.serverDownMsg }}
            </div>
          </div>
        </mdui-tooltip>
      </div>
    </Transition>

    <div
      class="absolute bottom-2 left-0 right-0 text-center text-gray-400 text-sm flex flex-col items-center"
    >
      <mdui-button
        @click="launchGame"
        :disabled="launching"
        :loading="launching"
        class="w-max mb-3 font-bold"
        >{{ $t('general.launchACC') }}</mdui-button
      >
      <div class="items-center flex flex-row">
        <img
          src="../assets/archiveIcon.png"
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
    </div>
  </div>
</template>

<style scoped>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 150ms var(--mdui-motion-easing-standard);
}
</style>
