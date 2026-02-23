<script setup lang="ts">
import '@mdui/icons/cell-tower--rounded.js'
import '@mdui/icons/view-list--rounded.js'
import '@mdui/icons/display-settings--rounded.js'
import '@mdui/icons/settings--rounded.js'
import '@mdui/icons/send--rounded.js'
import '@mdui/icons/balance--rounded.js'
import '@mdui/icons/close--rounded.js'
import '@mdui/icons/announcement.js'
import '@mdui/icons/download.js'
import '@mdui/icons/coffee--rounded.js'
import '@mdui/icons/celebration--rounded.js'
import '@mdui/icons/contact-support--rounded.js'
import '@mdui/icons/assistant--rounded.js'
import { onMounted, provide, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
import { setColorScheme, setTheme } from 'mdui'
import {
  asseconHimeThemeColor,
  darkModeSettings,
  themeMap,
} from '@/utils/enums'
import { translate } from '@/i18n'
import { marked } from 'marked'
import { launchSteam, openLink } from '@/utils/utils'
import axios from 'axios'
import AIDrawer from './components/AIDrawer.vue'

const router = useRouter()
const store = useStore()
setTheme(
  themeMap[store.settings.general.darkMode as keyof typeof themeMap] ?? 'auto',
)

const donationOpen1 = ref(false)
const donationOpen2 = ref(false)
const friendshipOpen = ref(false)
const contactOpen = ref(false)

const mode = ref(0) // 0: Server Status
const modes = [
  'general.status',
  'general.servers',
  'general.setup',
  'general.bop',
  'general.report',
  'general.launchACC',
  'general.settings',
]
const pages = ['status', 'list', 'setup', 'bop', 'report', '', 'settings']
const nav = (index: number) => {
  mode.value = index
  router.push({ name: pages[index] })
}

const aiDrawerOpen = ref(false)

const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')

const isDark = ref(
  store.settings.general.darkMode === darkModeSettings.AUTO
    ? darkModePreference.matches
    : store.settings.general.darkMode !== darkModeSettings.LIGHT,
)
darkModePreference.addEventListener('change', e => {
  isDark.value =
    store.settings.general.darkMode === darkModeSettings.AUTO
      ? e.matches
      : store.settings.general.darkMode !== darkModeSettings.LIGHT
})

provide('isDark', {
  isDark,
  setDark(val: boolean) {
    isDark.value = val
  },
})

const isMobile = computed(() => window.matchMedia('(max-width: 768px').matches)
provide('isMobile', isMobile)

const launching = ref(false)
const launchACC = () => {
  launching.value = true
  launchSteam('805550')
  setTimeout(() => {
    launching.value = false
  }, 3000)
}

const showBulletin = ref(false)
const bulletin = ref(undefined)
const queryBulletin = async () => {
  showBulletin.value = false
  // const res = await axios.get('http://0.0.0.0:5005/bulletin')
  const res = await axios.get('https://api.hh17.top/competizione/bulletin')
  if (res.data.success && res.data.msgInfo.id > store.general.msgId) {
    bulletin.value = res.data.msgInfo
    showBulletin.value = true
    store.general.msgId = res.data.msgInfo.id
  }
}

onMounted(() => {
  queryBulletin()
  for (let i = 0; i < pages.length; i++) {
    if (
      pages[i] &&
      window.location.hash.includes(pages[i] ?? 'nothing exists')
    ) {
      mode.value = i
    }
  }
})

const onHyperLinkClick = (e: Event) => {
  let anchor = (e.target as HTMLElement).closest('a')
  if (anchor) {
    let targetHref = anchor.getAttribute('href')

    if (targetHref) {
      e.preventDefault()
      let newUrl = anchor.href
      window.open(newUrl, '_blank')
    }
  }
}

watch(
  isDark,
  newVal => {
    if (store.settings.general.bgOpacity < 1) {
      const newScheme = newVal
        ? asseconHimeThemeColor.dark
        : asseconHimeThemeColor.light
      store.settings.general.themeColor = newScheme
      setColorScheme(newScheme)
    }
  },
  {
    immediate: true,
  },
)
</script>
<template>
  <Transition name="fade">
    <img
      class="w-screen h-screen absolute object-cover"
      v-if="store.settings.general.bgOpacity < 1 && !isMobile"
      :src="`/asseconHime/ASSECON_HIME_${isDark ? 'dark' : 'light'}.png`"
    />
    <img
      class="w-screen h-screen absolute object-cover object-top"
      v-else-if="store.settings.general.bgOpacity < 1 && isMobile"
      :src="`/asseconHime/ASSECON_HIME_${isDark ? 'dark_mobile' : 'light_mobile'}.png`"
    />
  </Transition>
  <mdui-layout class="size-full overflow-hidden" @click="onHyperLinkClick">
    <mdui-top-app-bar
      v-if="isMobile"
      variant="small"
      scroll-target="#mainRouterView"
      class="flex flex-row justify-center items-center h-10 bg-transparent"
    >
      <span
        class="font-bold title mr-2"
        style="color: rgb(var(--mdui-color-primary))"
        >{{ $t(modes[mode] ?? '') }}</span
      >
    </mdui-top-app-bar>
    <mdui-top-app-bar
      v-else
      variant="small"
      scroll-target="#mainRouterView"
      class="pt-1 pl-3 pr-4 drag bg-transparent flex flex-row justify-between h-16 items-center"
    >
      <div class="flex flex-row">
        <mdui-button-icon class="p-2 mr-5">
          <img src="../public/favicon.ico" alt="Website logo" />
        </mdui-button-icon>
        <div class="text-base mt-2">
          <span
            class="font-bold title mr-2"
            style="color: rgb(var(--mdui-color-primary))"
            >{{ $t(modes[mode] ?? '') }}</span
          >
          |
          <span class="ml-2 opacity-70">{{ $t('general.appName') }}</span>
        </div>
      </div>
      <div class="flex flex-row">
        <mdui-tooltip :content="$t('general.contact')">
          <mdui-button-icon @click="contactOpen = true"
            ><mdui-icon-contact-support--rounded></mdui-icon-contact-support--rounded>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="$t('general.friendshipLink')">
          <mdui-button-icon @click="friendshipOpen = true"
            ><mdui-icon-celebration--rounded></mdui-icon-celebration--rounded>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="$t('settings.donateButton')">
          <mdui-button-icon @click="donationOpen1 = true"
            ><mdui-icon-coffee--rounded></mdui-icon-coffee--rounded>
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-tooltip :content="$t('general.githubRepo')">
          <mdui-button-icon
            class="mr-2"
            :class="{ invert: isDark }"
            @click="
              openLink(
                'https://github.com/HoraceHuang-ui/Competizione-Companion',
              )
            "
          >
            <img src="@/assets/github-mark.png" class="p-2 pt-1.5" />
          </mdui-button-icon>
        </mdui-tooltip>
        <mdui-button
          variant="tonal"
          @click="
            openLink(
              'https://gitcode.com/HoraceHuang-ui/Competizione-Companion/releases',
            )
          "
        >
          <mdui-icon-download slot="icon"></mdui-icon-download>
          {{ $t('general.getApp') }}
        </mdui-button>
      </div>
    </mdui-top-app-bar>

    <mdui-navigation-rail
      v-if="!isMobile"
      value="status"
      divider
      class="pb-4 bg-transparent w-16"
      contained
    >
      <mdui-tooltip :content="translate('general.status')" placement="right">
        <mdui-button-icon
          class="mb-2"
          :class="{
            'bg-[rgb(var(--mdui-color-primary))] text-[rgb(var(--mdui-color-on-primary))]':
              mode == 0,
          }"
          @click="nav(0)"
        >
          <mdui-icon-cell-tower--rounded></mdui-icon-cell-tower--rounded>
        </mdui-button-icon>
      </mdui-tooltip>

      <mdui-tooltip :content="translate('general.servers')" placement="right">
        <mdui-button-icon
          class="mb-2"
          :class="{
            'bg-[rgb(var(--mdui-color-primary))] text-[rgb(var(--mdui-color-on-primary))]':
              mode == 1,
          }"
          @click="nav(1)"
        >
          <mdui-icon-view-list--rounded></mdui-icon-view-list--rounded>
        </mdui-button-icon>
      </mdui-tooltip>

      <mdui-tooltip :content="translate('general.setup')" placement="right">
        <mdui-button-icon
          class="mb-2"
          :class="{
            'bg-[rgb(var(--mdui-color-primary))] text-[rgb(var(--mdui-color-on-primary))]':
              mode == 2,
          }"
          @click="nav(2)"
        >
          <mdui-icon-display-settings--rounded></mdui-icon-display-settings--rounded>
        </mdui-button-icon>
      </mdui-tooltip>

      <mdui-tooltip :content="translate('general.bop')" placement="right">
        <mdui-button-icon
          class="mb-2"
          :class="{
            'bg-[rgb(var(--mdui-color-primary))] text-[rgb(var(--mdui-color-on-primary))]':
              mode == 3,
          }"
          @click="nav(3)"
        >
          <mdui-icon-balance--rounded></mdui-icon-balance--rounded>
        </mdui-button-icon>
      </mdui-tooltip>

      <mdui-tooltip :content="translate('general.report')" placement="right">
        <mdui-button-icon
          class="mb-2"
          :class="{
            'bg-[rgb(var(--mdui-color-primary))] text-[rgb(var(--mdui-color-on-primary))]':
              mode == 4,
          }"
          @click="nav(4)"
        >
          <mdui-icon-announcement></mdui-icon-announcement>
        </mdui-button-icon>
      </mdui-tooltip>

      <mdui-tooltip
        :content="'AI ' + $t('general.appNickName')"
        placement="right"
        slot="bottom"
        class="relative"
      >
        <div class="relative">
          <mdui-button-icon @click="aiDrawerOpen = true">
            <mdui-icon-assistant--rounded></mdui-icon-assistant--rounded>
          </mdui-button-icon>
          <mdui-badge
            class="absolute right-0 top-0 px-1"
            v-if="store.general.msgId < 3"
            >AI</mdui-badge
          >
        </div>
      </mdui-tooltip>

      <mdui-tooltip
        :content="translate('general.launchACC')"
        placement="right"
        slot="bottom"
        v-if="mode !== 0"
      >
        <mdui-button-icon class="mb-2" @click="launchACC" :disabled="launching">
          <Transition name="fade" mode="out-in">
            <mdui-circular-progress
              v-if="launching"
              class="p-2"
            ></mdui-circular-progress>
            <mdui-icon-send--rounded v-else></mdui-icon-send--rounded>
          </Transition>
        </mdui-button-icon>
      </mdui-tooltip>

      <mdui-tooltip
        :content="translate('general.settings')"
        placement="right"
        slot="bottom"
      >
        <mdui-button-icon
          :class="{
            'bg-[rgb(var(--mdui-color-primary))] text-[rgb(var(--mdui-color-on-primary))]':
              mode == 6,
          }"
          @click="nav(6)"
        >
          <mdui-icon-settings--rounded></mdui-icon-settings--rounded>
        </mdui-button-icon>
      </mdui-tooltip>
    </mdui-navigation-rail>

    <mdui-layout-main
      class="transition-all"
      :style="{
        background: `rgba(var(--mdui-color-surface), ${store.settings.general.bgOpacity || 0.85})`,
      }"
    >
      <router-view id="mainRouterView" v-slot="{ Component }" class="md:pr-4">
        <transition name="swipe-up" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </mdui-layout-main>

    <mdui-navigation-bar v-if="isMobile" :value="mode" class="bg-transparent">
      <mdui-navigation-bar-item icon="place" :value="0" @click="nav(0)"
        >{{ $t('general.statusShort') }}
        <mdui-icon-cell-tower--rounded
          slot="icon"
        ></mdui-icon-cell-tower--rounded>
      </mdui-navigation-bar-item>
      <mdui-navigation-bar-item icon="place" :value="3" @click="nav(3)"
        >{{ $t('general.bopShort') }}
        <mdui-icon-balance--rounded slot="icon"></mdui-icon-balance--rounded>
      </mdui-navigation-bar-item>
      <mdui-navigation-bar-item icon="place" :value="6" @click="nav(6)"
        >{{ $t('general.settings') }}
        <mdui-icon-settings--rounded slot="icon"></mdui-icon-settings--rounded>
      </mdui-navigation-bar-item>
    </mdui-navigation-bar>

    <mdui-dialog :open="showBulletin">
      <div
        slot="header"
        class="flex flex-row justify-between items-center text-2xl"
      >
        <div>{{ bulletin?.title?.[$t('langCode')] }}</div>
        <mdui-button-icon @click="showBulletin = false">
          <mdui-icon-close--rounded></mdui-icon-close--rounded>
        </mdui-button-icon>
      </div>
      <div
        class="overflow-y-scroll max-h-[500px] w-[400px] scroll-wrapper-app-vue"
      >
        <div v-html="marked(bulletin?.detail?.[$t('langCode')] || '')" />
      </div>
    </mdui-dialog>
  </mdui-layout>

  <mdui-dialog
    :headline="$t('settings.donation1Title')"
    :open="donationOpen1"
    @close="donationOpen1 = false"
  >
    <div>{{ $t('settings.donation1Msg') }}</div>
    <div class="flex flex-row mt-2">
      <img src="./assets/wechat.jpg" width="250" class="mr-2 donation-pic" />
      <img src="./assets/alipay.jpg" width="250" class="donation-pic" />
    </div>
    <mdui-button slot="action" variant="text" @click="donationOpen1 = false">{{
      $t('settings.donation1Cancel')
    }}</mdui-button>
    <mdui-button
      slot="action"
      class="font-bold"
      @click="
        () => {
          donationOpen1 = false
          donationOpen2 = true
        }
      "
      >{{ $t('settings.donation1Confirm') }}</mdui-button
    >
  </mdui-dialog>

  <mdui-dialog
    :headline="$t('settings.donation2Title')"
    :open="donationOpen2"
    @close="donationOpen2 = false"
  >
    <div>
      {{ $t('settings.donation2Msg') }}
    </div>
    <mdui-button
      slot="action"
      @click="donationOpen2 = false"
      class="title font-bold"
      >{{ $t('settings.donation2Confirm') }}</mdui-button
    >
  </mdui-dialog>

  <mdui-dialog
    :headline="$t('general.friendshipLink')"
    :open="friendshipOpen"
    @close="friendshipOpen = false"
    close-on-esc
    close-on-overlay-click
    :description="$t('general.friendshipLinkMsg')"
  >
    <ul class="mt-3 list-disc list-inside">
      <li>
        <a href="https://www.fullpush.cn" target="_blank">FULLPUSH</a>
        - ACC 个人开服管理与数据统计工具
      </li>
      <li>
        <a href="https://docs.qq.com/doc/DZUxEdEh0YXFUSkRW" target="_blank"
          >ACC 新手指南</a
        >
        - 嗨跑群友们共同维护的 ACC 游戏新手常见 Q&A
      </li>
    </ul>
    <mdui-button
      slot="action"
      class="font-bold"
      @click="friendshipOpen = false"
      variant="tonal"
      >{{ $t('general.close') }}</mdui-button
    >
  </mdui-dialog>

  <mdui-dialog
    :headline="$t('general.contact')"
    :open="contactOpen"
    :description="$t('general.contactMsg')"
    @close="contactOpen = false"
    close-on-esc
    close-on-overlay-click
  >
    <ul class="mt-3 list-disc list-inside select-text cursor-text">
      <li>QQ: 3214442497</li>
      <li>{{ $t('general.wechat') }}: HoraceHYY</li>
      <li>
        {{ $t('general.email') }}:
        <a href="mailto:horacehuang17@gmail.com">horacehuang17@gmail.com</a>
      </li>
      <li>
        {{ $t('general.hipoleId') }}: horacehuang17
        <div class="opacity-70 mt-1">
          {{ $t('general.hipoleIdMsg') }}
        </div>
      </li>
    </ul>
    <mdui-button
      slot="action"
      class="font-bold"
      @click="contactOpen = false"
      variant="tonal"
      >{{ $t('general.close') }}</mdui-button
    >
  </mdui-dialog>

  <AIDrawer v-model="aiDrawerOpen" />
</template>

<style>
.swipe-up-enter-from {
  transform: translateY(12vh);
  opacity: 0;
}
.swipe-up-leave-to {
  opacity: 0;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.swipe-up-enter-active,
.fade-enter-active,
.fade-leave-active {
  transition: all 400ms var(--mdui-motion-easing-standard);
}

h1,
h2,
h3,
h4,
h5,
.title {
  font-family:
    Google Sans,
    sans-serif;
}
a,
div,
span {
  font-family:
    Google Sans Text,
    sans-serif;
}
.marked {
  h1,
  h2,
  h3,
  h4 {
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1.4;
  }

  ul {
    list-style: disc inside;
    margin: 0.5rem 0;
  }

  ol {
    list-style: decimal inside;
    margin: 0.5rem 0;
  }

  table {
    margin: 0.5rem 0;

    thead {
      border: 2px solid;
    }
    th,
    td {
      border: 1px solid;
      padding: 0.25rem 0.5rem;
    }
  }
}

.scroll-wrapper-app-vue {
  scrollbar-color: rgba(var(--mdui-color-outline-variant), 0.8) transparent;
  scrollbar-width: thin;
  scrollbar-arrow-color: transparent;
}

.drag {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.donation-pic {
  border-radius: var(--mdui-shape-corner-large);
}
</style>
