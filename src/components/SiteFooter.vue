<script setup lang="ts">
import { inject, type Ref } from 'vue'
import SiteBeian from './SiteBeian.vue'

const dark = inject('isDark') as {
  isDark: Ref<boolean>
  setDark: (val: boolean) => void
}
</script>

<template>
  <div class="w-full">
    <div class="w-full text-center opacity-50 text-sm">
      {{ $t('settings.sponsor') }}
    </div>
    <div
      class="w-full text-center flex flex-row justify-center flex-wrap gap-3 items-center mb-6"
    >
      <mdui-tooltip placement="top" class="credits">
        <div slot="content" class="select-text cursor-text">
          {{ $t('settings.pxnTooltip') }}
        </div>
        <img
          :src="`/pxn/trans6${dark.isDark.value ? 'dark' : 'light'}.png`"
          class="inline opacity-55 hover:opacity-100 transition-all"
          width="200"
        />
      </mdui-tooltip>
    </div>

    <div class="w-full text-center opacity-50 text-sm">
      {{ $t('settings.thanks') }}
    </div>
    <div
      class="w-full text-center text-[rgb(var(--mdui-color-outline))] flex flex-row flex-wrap gap-3 justify-center items-center"
    >
      <mdui-tooltip placement="top" class="credits">
        <div slot="content">Dynamic Esports Academy</div>
        <img
          src="@/assets/DEA_light.png"
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
          class="flex flex-row items-center ml-3 mr-2 opacity-55 hover:opacity-100"
        >
          <img src="@/assets/HerMess.png" width="40" />
          <img src="@/assets/HerMess_text.png" width="90" />
        </div>
      </mdui-tooltip>

      <mdui-tooltip placement="top" class="credits">
        <div slot="content">
          <div>{{ $t('settings.illust') }}</div>
          <div>
            {{ $t('settings.xhs') }}
            <a
              href="https://xhslink.com/m/32eQI42uSqq"
              class="cursor-pointer"
              style="
                color: rgb(var(--mdui-color-inverse-primary));
                text-decoration: underline;
              "
              >@灵均子美
            </a>
            &nbsp;| Pixiv
            <a
              href="https://www.pixiv.net/users/121727636"
              class="cursor-pointer"
              style="
                color: rgb(var(--mdui-color-inverse-primary));
                text-decoration: underline;
              "
            >
              @霊均</a
            >
          </div>
        </div>
        <div
          class="flex flex-row items-center mx-4 opacity-55 transition-all hover:opacity-100"
        >
          <img
            src="/asseconHime/LJZM_profile.png"
            width="36"
            class="rounded-full mr-2"
          />
          <img
            src="/asseconHime/LJZM.png"
            width="70"
            :class="{ invert: dark.isDark.value }"
          />
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
          src="@/assets/acc-status.ico"
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
            src="@/assets/lonemeow.png"
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

    <div class="w-full">
      <div
        class="w-full text-center text-[rgb(var(--mdui-color-outline))] pb-2"
      >
        <p class="title">Made with ❤️ by horacehuang17</p>
        <p class="text-sm mb-1">
          {{ $t('settings.thanksMsg') }}
        </p>
      </div>
    </div>

    <SiteBeian />
  </div>
</template>

<style lang="scss" scoped>
.credits::part(popup) {
  border-radius: 999px;
  padding: 0.5rem 1rem;
}
.credits::part(content) {
  font-size: 1rem;
  line-height: 1.2;
}
</style>
