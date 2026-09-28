<script setup lang="ts">
import '@mdui/icons/desktop-windows--rounded.js'
import '@mdui/icons/desktop-mac--rounded.js'
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useStore } from '@/store'
import SiteFooter from '@/components/SiteFooter.vue'
import { openLink } from '@/utils/utils'

type Platform = 'Win' | 'Mac'

interface UpdInfo {
  version?: string
  desc?: Record<string, string>
  dlUrl?: string
  size?: string
  dlUrlMac?: string
  sizeMac?: string
}

const store = useStore()

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent
  const platformStr = navigator.platform ?? ''

  if (/Windows|Win32|Win64/i.test(ua)) {
    return 'Win'
  }
  if (/Macintosh|Mac OS X|MacIntel/i.test(ua + platformStr)) {
    return 'Mac'
  }
  return 'Win'
}

const platform = ref<Platform>(detectPlatform())
const otherPlatform = computed<Platform>(() =>
  platform.value === 'Win' ? 'Mac' : 'Win',
)

const updInfo = ref<UpdInfo | null>(null)
const fetchFailed = ref(false)

const getUrl = (p: Platform) =>
  p === 'Win' ? updInfo.value?.dlUrl : updInfo.value?.dlUrlMac

const download = (p: Platform) => {
  const url = getUrl(p)
  if (url) {
    window.location.href = url
  }
}

onMounted(async () => {
  try {
    const res = await axios.get(
      'https://api.hh17.top/competizione/competizione',
    )
    if (res.data?.success && res.data?.updInfo) {
      updInfo.value = res.data.updInfo
      // 自动跳转到当前平台对应的下载链接
      download(platform.value)
    } else {
      fetchFailed.value = true
    }
  } catch {
    fetchFailed.value = true
  }
})
</script>

<template>
  <div class="min-h-full w-full flex flex-col">
    <div class="flex-1 flex flex-col ml-10 justify-center px-4 py-10 md:px-8">
      <h1 class="font-bold text-3xl md:text-5xl mb-4">
        {{ $t('download.thanksTitle', { appName: $t('general.appName') }) }}
      </h1>
      <p class="text-base md:text-lg opacity-80 mb-8">
        {{ $t('download.subtitle') }}
      </p>

      <div class="flex flex-row flex-wrap items-center gap-x-4 gap-y-4">
        <mdui-button variant="filled" @click="download(platform)">
          <mdui-icon-desktop-windows--rounded
            v-if="platform === 'Win'"
            slot="icon"
          ></mdui-icon-desktop-windows--rounded>
          <mdui-icon-desktop-mac--rounded
            v-else
            slot="icon"
          ></mdui-icon-desktop-mac--rounded>
          {{
            platform === 'Win'
              ? $t('download.downloadWin')
              : $t('download.downloadMac')
          }}
        </mdui-button>

        <mdui-button variant="tonal" @click="download(otherPlatform)">
          <mdui-icon-desktop-mac--rounded
            v-if="otherPlatform === 'Mac'"
            slot="icon"
          ></mdui-icon-desktop-mac--rounded>
          <mdui-icon-desktop-windows--rounded
            v-else
            slot="icon"
          ></mdui-icon-desktop-windows--rounded>
          {{
            otherPlatform === 'Mac'
              ? $t('download.downloadMac')
              : $t('download.downloadWin')
          }}
        </mdui-button>

        <div class="text-sm opacity-80">
          {{
            $t('download.currentVersion', {
              version: updInfo?.version ?? '—',
            })
          }}
        </div>
      </div>

      <p
        v-if="fetchFailed"
        class="text-sm mt-4 text-[rgb(var(--mdui-color-error))]"
      >
        {{ $t('download.fetchFailed') }}
      </p>
    </div>

    <div class="sticky bottom-0 w-full flex justify-center">
      <div class="w-full">
        <div
          class="w-full text-center text-[rgb(var(--mdui-color-outline))] pb-2"
        >
          <p class="title">Made with ❤️ by horacehuang17</p>
          <p class="text-sm mb-1">
            {{ $t('settings.thanksMsg') }}
          </p>

          <div
            class="justify-center items-center flex flex-row w-full text-[rgb(var(--mdui-color-outline))] text-sm"
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
        </div>
      </div>
    </div>
  </div>
</template>
