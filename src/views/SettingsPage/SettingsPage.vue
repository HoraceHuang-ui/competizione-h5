<script setup lang="ts">
import ScrollWrapper from '@/components/ScrollWrapper.vue'
import { useStore } from '@/store'
import ChipSelect from '@/components/ChipSelect.vue'
import '@mdui/icons/light-mode--rounded.js'
import '@mdui/icons/brightness-auto--rounded.js'
import '@mdui/icons/dark-mode--outlined.js'
import '@mdui/icons/update--rounded.js'
import '@mdui/icons/image--rounded.js'
import '@mdui/icons/undo--rounded.js'
import '@mdui/icons/help-outline--rounded.js'
import { computed, type ComputedRef, inject, ref, type Ref, watch } from 'vue'
import { setColorScheme, setTheme } from 'mdui'
import { darkModeSettings, themeMap, trackCarDispSettings } from '@/utils/enums'
import { availableLangCodes, langMap, switchLang, translate } from '@/i18n'
import { ChromePicker } from 'vue-color'
import FavDialog from '@/views/SettingsPage/components/FavDialog.vue'
import { openLink } from '@/utils/utils'

const showFavDialog = ref(false)

const store = useStore()

const dark = inject('isDark') as {
  isDark: Ref<boolean>
  setDark: (val: boolean) => void
}
const isMobile = inject('isMobile') as ComputedRef<boolean>

const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')

if (!localStorage.lang) {
  localStorage.lang = 'en_US'
}
const lang = ref(localStorage.lang || 'en_US')
const dispMap = ['dispEnFull', 'dispEnShort', 'dispLocalShort']
const dispItems = computed(() => {
  if (lang.value === 'en_US' || isMobile.value) {
    return [1, 2]
  } else {
    return [1, 2, 3]
  }
})

const themeModes = ['light', 'auto', 'dark']
const darkModeChange = (event?: Event, item = 1) => {
  const mode = event?.target?.value ?? item
  store.settings.general.darkMode = mode
  setTheme(themeMap[mode])

  dark.setDark(
    store.settings.general.darkMode === darkModeSettings.AUTO
      ? darkModePreference.matches
      : store.settings.general.darkMode !== darkModeSettings.LIGHT,
  )
}

const resetDialogOpen = ref(false)

const resetSettings = () => {
  resetDialogOpen.value = false
  store.clear()
  if (
    ['舞萌DX启动！', 'Time for maimai DX!'].includes(
      store.settings.status.serverDownMsg,
    )
  ) {
    store.settings.status.serverDownMsg = translate(
      'settings.serverDownMsgDefault',
    )
  }
}

const onLangSelect = () => {
  switchLang(lang.value)
  if (
    ['舞萌DX启动！', 'Time for maimai DX!'].includes(
      store.settings.status.serverDownMsg,
    )
  ) {
    store.settings.status.serverDownMsg = translate(
      'settings.serverDownMsgDefault',
    )
  }

  if (lang.value === 'en_US') {
    store.settings.setup.carDisplay = trackCarDispSettings.EN_SHORT
    store.settings.setup.trackDisplay = trackCarDispSettings.EN_SHORT
  }
}

let throttleTimeout: ReturnType<typeof setTimeout> | null = null
let lastThemeColor: string | null = null

watch(
  () => store.settings.general.themeColor,
  newColor => {
    if (throttleTimeout) {
      clearTimeout(throttleTimeout)
    }
    throttleTimeout = setTimeout(() => {
      if (lastThemeColor !== newColor) {
        setColorScheme(newColor)
        lastThemeColor = newColor
      }
    }, 100)
  },
)
</script>

<template>
  <div class="h-full flex flex-col justify-center items-center relative w-full">
    <mdui-card
      :variant="isMobile ? 'filled' : 'outlined'"
      :class="
        isMobile
          ? 'size-full flex transition-all'
          : 'size-full transition-all border border-[rgb(var(--mdui-color-inverse-primary-dark))] mx-4 mb-4 flex'
      "
      :style="{
        background: isMobile
          ? `transparent`
          : `rgba(var(--mdui-color-surface-container-lowest), ${(0.65 * (store.settings.general.bgOpacity || 0.85)) / 0.85})`,
      }"
    >
      <ScrollWrapper
        class="pl-2 pr-1"
        :show-bar="isMobile ? 'always' : 'hover'"
      >
        <div class="px-2 pt-6 text-sm">
          <div class="title header">{{ $t('settings.general') }}</div>
          <div class="category">
            <div class="item">
              <div class="item-in">
                <div>{{ $t('settings.language') }}</div>
                <ChipSelect
                  v-model="lang"
                  :items="availableLangCodes"
                  chip-class="rounded-full"
                  :chip-label="item => langMap[item]"
                  :item-label="item => langMap[item]"
                  @select="onLangSelect"
                />
              </div>
            </div>
            <div class="item">
              <div class="item-in">
                <div>{{ $t('settings.darkMode') }}</div>
                <ChipSelect
                  v-if="isMobile"
                  v-model="store.settings.general.darkMode"
                  :items="[1, 2, 3]"
                  chip-class="rounded-full"
                  :chip-label="item => $t(`settings.${themeModes[item - 1]}`)"
                  :item-label="item => $t(`settings.${themeModes[item - 1]}`)"
                  @select="item => darkModeChange(undefined, item)"
                />
                <mdui-segmented-button-group
                  v-else
                  class="rounded-full"
                  selects="single"
                  :value="store.settings.general.darkMode"
                  @change="darkModeChange"
                >
                  <mdui-segmented-button
                    class="border border-[rgb(var(--mdui-color-outline-variant))]"
                    :value="1"
                  >
                    <mdui-icon-light-mode--rounded></mdui-icon-light-mode--rounded>
                  </mdui-segmented-button>
                  <mdui-segmented-button
                    class="border border-[rgb(var(--mdui-color-outline-variant))]"
                    :value="2"
                  >
                    <mdui-icon-brightness-auto--rounded></mdui-icon-brightness-auto--rounded>
                  </mdui-segmented-button>
                  <mdui-segmented-button
                    class="border border-[rgb(var(--mdui-color-outline-variant))]"
                    :value="3"
                  >
                    <mdui-icon-dark-mode--outlined></mdui-icon-dark-mode--outlined>
                  </mdui-segmented-button>
                </mdui-segmented-button-group>
              </div>
            </div>
            <div class="item">
              <div class="item-in">
                <div>{{ $t('settings.colorScheme') }}</div>
                <div class="flex flex-row items-center">
                  <mdui-tooltip
                    placement="bottom"
                    variant="rich"
                    :headline="$t('settings.bgOpacity')"
                  >
                    <div slot="content" class="w-[300px]">
                      <mdui-slider
                        class="px-4"
                        :value="store.settings.general.bgOpacity || 0.85"
                        :min="0.5"
                        :step="0.05"
                        :max="1"
                        @input="
                          store.settings.general.bgOpacity = $event.target.value
                        "
                        nolabel
                      ></mdui-slider>
                    </div>
                    <div
                      class="mr-2 px-4 py-2.5 rounded-full h-10"
                      style="
                        background: rgba(
                          var(--mdui-color-inverse-on-surface),
                          0.6
                        );
                      "
                    >
                      {{
                        (
                          (store.settings.general.bgOpacity || 0.85) * 100
                        ).toFixed(0)
                      }}%
                    </div>
                  </mdui-tooltip>
                  <mdui-tooltip placement="bottom-end" class="picker">
                    <ChromePicker
                      slot="content"
                      v-model="store.settings.general.themeColor"
                    />
                    <div
                      class="flex flex-row items-center rounded-full h-10 p-1 bg-[rgb(var(--mdui-color-inverse-on-surface))]"
                    >
                      <div
                        class="rounded-full w-8 h-8"
                        :style="{
                          background: store.settings.general.themeColor,
                        }"
                      />
                      <div class="p-3" style="font-family: Consolas">
                        {{ store.settings.general.themeColor.toUpperCase() }}
                      </div>
                    </div>
                  </mdui-tooltip>
                </div>
              </div>
            </div>
            <div
              class="flex flex-row justify-center md:justify-start md:ml-6 w-full"
            >
              <mdui-button
                variant="text"
                @click="resetDialogOpen = true"
                :class="{ 'mb-2': isMobile }"
                >{{ $t('settings.reset') }}</mdui-button
              >
            </div>
          </div>
          <div class="title header">{{ $t('general.status') }}</div>
          <div class="category">
            <div class="item" style="padding-right: 0.5rem">
              <div class="item-in">
                <div>{{ $t('settings.serverDownMsg') }}</div>
                <mdui-text-field
                  class="msg-input w-60 cursor-text h-[46px]"
                  :placeholder="$t('settings.serverDownMsgPlaceholder')"
                  variant="outlined"
                  :value="store.settings.status.serverDownMsg"
                  @input="
                    store.settings.status.serverDownMsg = $event.target.value
                  "
                ></mdui-text-field>
              </div>
            </div>
          </div>
          <div class="title header">{{ $t('general.setup') }}</div>
          <div class="category">
            <div class="item">
              <div class="item-in">
                <div>{{ $t('settings.carDisp') }}</div>
                <ChipSelect
                  v-model="store.settings.setup.carDisplay"
                  chip-class="rounded-full"
                  :items="dispItems"
                  :item-label="item => $t(`settings.${dispMap[item - 1]}`)"
                  :chip-label="item => $t(`settings.${dispMap[item - 1]}`)"
                >
                </ChipSelect>
              </div>
            </div>
            <div class="item">
              <div class="item-in">
                <div>{{ $t('settings.trackDisp') }}</div>
                <ChipSelect
                  v-model="store.settings.setup.trackDisplay"
                  chip-class="rounded-full"
                  :items="dispItems"
                  :item-label="item => $t(`settings.${dispMap[item - 1]}`)"
                  :chip-label="item => $t(`settings.${dispMap[item - 1]}`)"
                >
                </ChipSelect>
              </div>
            </div>
            <div class="item">
              <div class="item-in">
                <div class="flex flex-row items-center">
                  <div>{{ $t('settings.favCarsTracks') }}</div>
                  <mdui-tooltip :content="$t('settings.favCarsTracksTooltip')">
                    <mdui-button-icon>
                      <mdui-icon-help-outline--rounded></mdui-icon-help-outline--rounded> </mdui-button-icon
                  ></mdui-tooltip>
                </div>
                <mdui-button variant="tonal" @click="showFavDialog = true">
                  {{ $t('general.clickToSet') }}
                </mdui-button>
              </div>
            </div>
            <div class="item" v-if="lang !== 'en_US' && !isMobile">
              <div class="item-in">
                <div>{{ $t('settings.paramsEn') }}</div>
                <mdui-switch
                  :checked="store.settings.setup.setupLabelEn"
                  @change="
                    store.settings.setup.setupLabelEn = $event.target.checked
                  "
                ></mdui-switch>
              </div>
            </div>
          </div>
          <div class="title header">{{ $t('settings.about') }}</div>
          <div class="category" style="margin-bottom: 1rem">
            <div class="item">
              <div class="item-in">
                <div class="flex flex-row items-center">
                  <div>{{ $t('general.githubRepo') }}</div>
                </div>
                <div class="flex flex-row justify-end items-center">
                  <mdui-button-icon
                    class="mr-2"
                    :class="{ invert: dark.isDark.value }"
                    @click="
                      openLink(
                        'https://github.com/HoraceHuang-ui/Competizione-Companion',
                      )
                    "
                  >
                    <img src="../../assets/github-mark.png" class="p-1" />
                  </mdui-button-icon>
                </div>
              </div>
            </div>
            <div class="larger mt-4">
              <div
                class="w-full text-center text-[rgb(var(--mdui-color-outline))] flex flex-row flex-wrap gap-3 justify-center items-center"
              >
                <mdui-tooltip placement="top" class="credits">
                  <div slot="content">Dynamic Esports Academy</div>
                  <img
                    src="../../assets/DEA_light.png"
                    class="mx-4 transition-all inline px-1 py-0.5 mb-0.5 rounded-full bg-[rgb(var(--mdui-color-primary-light))] opacity-55 hover:opacity-100"
                    width="80"
                  />
                </mdui-tooltip>

                <mdui-tooltip placement="top" class="credits">
                  <div slot="content" class="select-text cursor-text">
                    <a
                      class="cursor-pointer"
                      href="https://www.hipole.com/"
                      style="
                        color: rgb(var(--mdui-color-inverse-primary));
                        text-decoration: underline;
                      "
                      >HiPole</a
                    >{{ $t('settings.hipoleTooltip') }}
                  </div>
                  <img
                    :src="`/hipole/${$t('langCode')}_${dark.isDark.value ? 'dark' : 'light'}.png`"
                    class="inline mx-4 opacity-55 hover:opacity-100 transition-all"
                    width="130"
                  />
                </mdui-tooltip>

                <mdui-tooltip placement="top" class="credits">
                  <div slot="content" class="select-text cursor-text">
                    {{ $t('settings.hmrTooltip') }}
                  </div>
                  <div
                    class="flex flex-row items-center mx-4 opacity-55 hover:opacity-100"
                  >
                    <img src="../../assets/HerMess.png" width="40" />
                    <img src="../../assets/HerMess_text.png" width="90" />
                  </div>
                </mdui-tooltip>

                <mdui-tooltip placement="top" class="credits">
                  <div slot="content">
                    <a
                      class="cursor-pointer"
                      href="https://acc-status.jonatan.net/"
                      style="
                        color: rgb(var(--mdui-color-inverse-primary));
                        text-decoration: underline;
                      "
                      >acc-status.jonatan.net</a
                    >
                  </div>
                  <img
                    src="../../assets/acc-status.ico"
                    class="transition-all mx-4 inline px-2 py-1.5 mb-0.5 rounded-full opacity-55 hover:opacity-100 bg-[rgb(var(--mdui-color-primary-dark))]"
                    width="40"
                  />
                </mdui-tooltip>

                <mdui-tooltip placement="top" class="credits">
                  <div slot="content">
                    <a
                      class="cursor-pointer"
                      href="https://lonemeow.github.io/acc-setup-diff/"
                      style="
                        color: rgb(var(--mdui-color-inverse-primary));
                        text-decoration: underline;
                      "
                      >acc-setup-diff</a
                    >
                    |
                    <a
                      href="https://github.com/lonemeow/acc-connector"
                      class="cursor-pointer"
                      style="
                        color: rgb(var(--mdui-color-inverse-primary));
                        text-decoration: underline;
                      "
                      >acc-connector</a
                    >
                  </div>
                  <div
                    class="flex flex-row items-center mx-4 opacity-55 hover:opacity-100"
                  >
                    <img
                      src="../../assets/lonemeow.png"
                      class="inline mr-1 rounded-full transition-all"
                      width="30"
                    />
                    <div class="ml-1 text-[rgb(var(--mdui-color-on-surface))]">
                      lonemeow
                    </div>
                  </div>
                </mdui-tooltip>
              </div>
              <mdui-divider class="my-4 opacity-60"></mdui-divider>
              <div class="item-in">
                <div
                  class="w-full text-center text-[rgb(var(--mdui-color-outline))] pb-2"
                >
                  <p class="title">Made with ❤️ by horacehuang17</p>
                  <p class="text-sm mb-1">
                    {{ $t('settings.thanksMsg') }}
                  </p>

                  <div
                    class="justify-center items-center flex flex-row w-full text-[rgb(var(--mdui-color-outline))] text-sm"
                    v-if="!isMobile"
                  >
                    <img
                      src="../../assets/archiveIcon.png"
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

          <div
            class="mb-4 justify-center items-center flex flex-col w-full text-[rgb(var(--mdui-color-outline))] text-sm"
            v-if="isMobile"
          >
            <div class="flex flex-row">
              <img
                src="../../assets/archiveIcon.png"
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
      </ScrollWrapper>
    </mdui-card>

    <mdui-dialog
      :open="resetDialogOpen"
      close-on-overlay-click
      close-on-esc
      :headline="$t('settings.resetConfirm')"
    >
      <mdui-button
        slot="action"
        variant="text"
        @click="resetDialogOpen = false"
        >{{ $t('general.cancel') }}</mdui-button
      >
      <mdui-button slot="action" @click="resetSettings" class="font-bold">{{
        $t('general.confirm')
      }}</mdui-button>
    </mdui-dialog>

    <UpdateDialog v-model="updDialogShow" :upd-info="updInfo" />

    <FavDialog v-model="showFavDialog" />
  </div>
</template>

<style lang="scss" scoped>
.msg-input::part(container) {
  border-radius: 999px;
  background: rgb(var(--mdui-color-on-secondary));
}
.header {
  font-size: 1.875rem;
  line-height: 1.2;
  font-weight: bold;
  margin-bottom: 0.5rem;
  margin-left: 1rem;
}

.category {
  width: 100%;
  margin-bottom: 1rem;

  .item {
    height: 60px;
    cursor: default;
    padding: 0 1rem;
    margin: 0.125rem 0 0.125rem 1.5rem;
    justify-content: space-between;
    border-radius: 30px;
    transition: all var(--mdui-motion-duration-short4)
      var(--mdui-motion-easing-standard);

    &.larger {
      height: max-content;
      min-height: 60px;
      padding: 0.75rem 1rem;
    }

    &:hover {
      background: rgba(var(--mdui-color-secondary-container), 0.3);
    }
  }

  .item-in {
    height: 100%;
    padding-left: 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    &.larger {
      align-items: baseline;
    }
  }
}

@media (max-width: 768px) {
  .header {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    opacity: 0.8;
  }

  .category {
    width: 100%;
    margin-bottom: 2rem;
    background-color: rgba(var(--mdui-color-surface-container-lowest), 0.45);
    border-radius: 30px;

    .item {
      height: 60px;
      cursor: default;
      padding: 0 1rem;
      margin: 0.125rem 0;
      justify-content: space-between;
      border-radius: 30px;
      transition: all var(--mdui-motion-duration-short4)
        var(--mdui-motion-easing-standard);

      &.larger {
        height: max-content;
        min-height: 60px;
        padding: 0.75rem 1rem;
      }

      &:hover {
        background: transparent;
      }
    }

    .item-in {
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      &.larger {
        align-items: baseline;
      }
    }
  }
}

.scroll-wrapper {
  scrollbar-color: rgba(var(--mdui-color-outline-variant), 0.8) transparent;
  scrollbar-width: thin;
  scrollbar-arrow-color: transparent;
}

.credits::part(popup) {
  border-radius: 999px;
  padding: 0.5rem 1rem;
}
.credits::part(content) {
  font-size: 1rem;
  line-height: 1.2;
}
.picker::part(popup) {
  padding: 1rem;
  background: none;
}
</style>
