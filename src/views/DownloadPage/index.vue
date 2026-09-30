<script setup lang="ts">
import '@mdui/icons/desktop-windows--rounded.js'
import '@mdui/icons/desktop-mac--rounded.js'
import '@mdui/icons/keyboard-arrow-down--rounded.js'
import '@mdui/icons/content-copy--rounded.js'
import '@mdui/icons/check--rounded.js'
import 'mdui/components/collapse.js'
import 'mdui/components/collapse-item.js'
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { snackbar } from 'mdui'
import { translate } from '@/i18n'
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

// macOS 用户默认展开注意事项，其他平台默认收起
const isMac = computed(() => platform.value === 'Mac')
const macNoticeOpen = ref(isMac.value)
const macCopied = ref(false)
let macCopiedTimer: number | undefined

const copyMacCommands = async () => {
  try {
    await navigator.clipboard.writeText(translate('download.macNoticeCommands'))
    macCopied.value = true
    snackbar({
      message: translate('download.macNoticeCopied'),
      autoCloseDelay: 2000,
    })
    window.clearTimeout(macCopiedTimer)
    macCopiedTimer = window.setTimeout(() => {
      macCopied.value = false
    }, 2000)
  } catch {
    snackbar({
      message: translate('download.macNoticeCopyFail'),
      autoCloseDelay: 3000,
    })
  }
}

// 接口 10 秒未返回则视为失联，展示备用下载入口
const FETCH_TIMEOUT = 10000
const GITHUB_RELEASES =
  'https://github.com/HoraceHuang-ui/Competizione-Companion/releases'
const GITCODE_RELEASES =
  'https://gitcode.com/HoraceHuang-ui/Competizione-Companion/releases'

type FetchStatus = 'loading' | 'ok' | 'failed'

const updInfo = ref<UpdInfo | null>(null)
const status = ref<FetchStatus>('loading')

const isLoading = computed(() => status.value === 'loading')
const fetchFailed = computed(() => status.value === 'failed')

const getUrl = (p: Platform) =>
  p === 'Win' ? updInfo.value?.dlUrl : updInfo.value?.dlUrlMac

const download = (p: Platform) => {
  const url = getUrl(p)
  if (url) {
    window.location.href = url
  }
}

const fetchUpdInfo = async () => {
  status.value = 'loading'
  try {
    const res = await axios.get(
      'https://api.hh17.top/competizione/competizione',
      { timeout: FETCH_TIMEOUT },
    )
    if (res.data?.success && res.data?.updInfo) {
      updInfo.value = res.data.updInfo
      status.value = 'ok'
      // 自动跳转到当前平台对应的下载链接
      download(platform.value)
    } else {
      status.value = 'failed'
    }
  } catch {
    status.value = 'failed'
  }
}

onMounted(fetchUpdInfo)
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

      <div
        v-if="!fetchFailed"
        class="flex flex-row flex-wrap items-center gap-x-4 gap-y-4"
      >
        <mdui-button
          variant="filled"
          :disabled="isLoading"
          @click="download(platform)"
        >
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

        <mdui-button
          variant="tonal"
          :disabled="isLoading"
          @click="download(otherPlatform)"
        >
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

        <div
          v-if="isLoading"
          class="text-sm opacity-80 flex flex-row items-center gap-x-2"
        >
          <mdui-circular-progress class="w-4 h-4 shrink-0" />
          <span>{{ $t('download.fetchingVersion') }}</span>
        </div>

        <div v-else class="text-sm opacity-80">
          {{
            $t('download.currentVersion', {
              version: updInfo?.version ?? '—',
            })
          }}
        </div>
      </div>

      <div v-else class="flex flex-col items-start gap-y-4">
        <p class="text-base md:text-lg opacity-80">
          {{ $t('download.fallbackPrefix') }}
          <a
            class="download-fallback-link"
            :href="GITHUB_RELEASES"
            @click.prevent="openLink(GITHUB_RELEASES)"
          >
            GitHub
          </a>
          {{ $t('download.fallbackOr') }}
          <a
            class="download-fallback-link"
            :href="GITCODE_RELEASES"
            @click.prevent="openLink(GITCODE_RELEASES)"
          >
            GitCode
          </a>
          {{ $t('download.fallbackSuffix') }}
        </p>

        <mdui-button variant="tonal" @click="fetchUpdInfo">
          {{ $t('download.retry') }}
        </mdui-button>
      </div>

      <mdui-collapse
        accordion
        class="w-full max-w-3xl mt-8"
        :value="macNoticeOpen ? 'mac-notice' : ''"
        @change="macNoticeOpen = $event.target.value === 'mac-notice'"
      >
        <mdui-collapse-item value="mac-notice">
          <div
            slot="header"
            class="flex flex-row items-center cursor-pointer py-1"
          >
            <mdui-icon-keyboard-arrow-down--rounded
              class="opacity-60 shrink-0"
            ></mdui-icon-keyboard-arrow-down--rounded>
            <div
              class="ml-1"
              :class="isMac ? 'font-bold' : 'font-normal'"
              style="color: rgb(var(--mdui-color-on-surface))"
            >
              {{ $t('download.macNoticeTitle') }}
            </div>
          </div>

          <div class="pl-6 pb-2">
            <p class="text-sm opacity-80 mb-3 select-text">
              {{
                $t('download.macNoticeDesc', {
                  appName: $t('general.appNickName'),
                })
              }}
            </p>

            <div class="mac-code-block">
              <mdui-button-icon
                class="mac-code-copy ml-4 size-5"
                :title="$t('download.macNoticeCopy')"
                @click="copyMacCommands"
              >
                <mdui-icon-check--rounded
                  v-if="macCopied"
                ></mdui-icon-check--rounded>
                <mdui-icon-content-copy--rounded
                  v-else
                ></mdui-icon-content-copy--rounded>
              </mdui-button-icon>
              <div class="mac-code-scroll">
                {{ $t('download.macNoticeCommands') }}
              </div>
            </div>

            <p class="text-sm opacity-60 mt-2 select-text">
              {{ $t('download.macNoticeTip') }}
            </p>
          </div>
        </mdui-collapse-item>
      </mdui-collapse>
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

<style scoped lang="scss">
.download-fallback-link {
  color: rgb(var(--mdui-color-primary));
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.mac-code-block {
  position: relative;
  padding: 12px 52px 12px 16px;
  border-radius: 12px;
  background: rgb(var(--mdui-color-surface-container-highest));
}

.mac-code-copy {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  opacity: 0.75;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
}

.mac-code-scroll {
  margin: 0;
  overflow-x: auto;
  color: rgb(var(--mdui-color-on-surface));
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre;
  user-select: text;
  opacity: 0.9;
}
</style>
