<script setup lang="ts">
import '@mdui/icons/file-upload--rounded.js'
import '@mdui/icons/insert-drive-file--rounded.js'

import { computed, ref, watch } from 'vue'
import { snackbar } from 'mdui'
import carData from '@/utils/carData.ts'
import SetupDisplay from '@/views/SetupMgmtPage/components/SetupDisplay.vue'
import ScrollWrapper from '@/components/ScrollWrapper.vue'
import '@mdui/icons/arrow-drop-down--rounded.js'
import '@mdui/icons/check--rounded.js'
import ChipSelect from '@/components/ChipSelect.vue'
import { useStore } from '@/store'
import { seriesColorMap } from '@/utils/enums'
import { translate } from '@/i18n'
import SetupCode from '@/views/SetupMgmtPage/components/SetupCode.vue'
import CarSelector from '@/components/CarSelector.vue'
import TrackSelector from '@/components/TrackSelector.vue'
import { getCarByKey } from '@/utils/utils'

const store = useStore()

const leftFileInput = ref<HTMLInputElement | null>(null)
const rightFileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref({ left: false, right: false })
const setupScroll = ref(0)
const setupOpenGroups = ref([])
type Side = 'left' | 'right'

const counterSide = (side: Side) => {
  return side === 'left' ? 'right' : 'left'
}

const groups = ['GT3', 'GT4', 'GTC', 'TCX']
const curGroup = ref('GT3')
const setupList = ref({
  left: [],
  right: [],
})
const fileSearch = ref(
  sessionStorage.setupFileNames
    ? JSON.parse(sessionStorage.setupFileNames)
    : {
        left: '',
        right: '',
      },
)

const curCar = ref({
  left: undefined,
  right: undefined,
})
const curTrack = ref({
  left: undefined,
  right: undefined,
})
const files = ref(
  sessionStorage.setupFiles
    ? JSON.parse(sessionStorage.setupFiles)
    : {
        left: undefined,
        right: undefined,
      },
)

watch(
  files,
  () => {
    sessionStorage.setupFiles = JSON.stringify(files.value)
    sessionStorage.setupFileNames = JSON.stringify(fileSearch.value)
  },
  { deep: true },
)

const triggerFileInput = (side: 'left' | 'right') => {
  if (side === 'left') {
    leftFileInput.value?.click()
  } else {
    rightFileInput.value?.click()
  }
}

const getCarSeries = (carName: string) => {
  for (const group of groups) {
    if (Object.keys(carData[group]).includes(carName)) {
      return group
    }
  }
  return undefined
}

const fileImportOpen = ref<String | undefined>(undefined)
const curSaveTrack = ref(undefined)
const handleFileSelect = async (side: 'left' | 'right', event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const content = await file.text()
    const jsonContent = JSON.parse(content)
    if (!jsonContent.carName) {
      snackbar({
        message: translate('setup.invalidJSON'),
        autoCloseDelay: 3000,
      })
      return
    }
    if (!files.value[counterSide(side)]) {
      const carSeries = getCarSeries(jsonContent.carName)
      if (carSeries) {
        curGroup.value = carSeries
        curCar.value[side] = {
          value: jsonContent.carName,
          label:
            jsonContent.carName in carData[curGroup.value]
              ? carData[curGroup.value][jsonContent.carName].name
              : jsonContent.carName,
        }
        fileSearch.value[side] = file.name
        files.value[side] = jsonContent
        if (!store.settings.setup.alwaysViewOnly) {
          fileImportOpen.value = side
        }
      }
    } else if (
      !Object.keys(carData[curGroup.value]).includes(jsonContent.carName)
    ) {
      snackbar({
        message: translate('setup.invalidSeries', {
          series: curGroup.value,
        }),
        autoCloseDelay: 3000,
      })
    } else {
      fileSearch.value[side] = file.name
      files.value[side] = jsonContent
      if (!store.settings.setup.alwaysViewOnly) {
        fileImportOpen.value = side
      }
    }
  }
}

const handleDrop = async (side: 'left' | 'right', event: DragEvent) => {
  event.preventDefault()
  isDragging.value[side] = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type === 'application/json') {
    const content = await file.text()
    const jsonContent = JSON.parse(content)
    if (!jsonContent.carName) {
      snackbar({
        message: translate('setup.invalidJSON'),
        autoCloseDelay: 3000,
      })
      return
    }
    if (!files.value[counterSide(side)]) {
      const carSeries = getCarSeries(jsonContent.carName)
      if (carSeries) {
        curGroup.value = carSeries
        curCar.value[side] = {
          value: jsonContent.carName,
          label:
            jsonContent.carName in carData[curGroup.value]
              ? carData[curGroup.value][jsonContent.carName].name
              : jsonContent.carName,
        }
        fileSearch.value[side] = file.name
        files.value[side] = jsonContent
        if (!store.settings.setup.alwaysViewOnly) {
          fileImportOpen.value = side
        }
      }
    } else if (
      !Object.keys(carData[curGroup.value]).includes(jsonContent.carName)
    ) {
      snackbar({
        message: translate('setup.invalidSeries', { series: curGroup.value }),
        autoCloseDelay: 3000,
      })
      return
    }
    fileSearch.value[side] = file.name
    files.value[side] = jsonContent
    if (!store.settings.setup.alwaysViewOnly) {
      fileImportOpen.value = side
    }
  } else {
    snackbar({
      message: translate('setup.invalidFile'),
      autoCloseDelay: 3000,
    })
  }
}

const closeFileSaveDialog = () => {
  fileImportOpen.value = undefined
  curSaveTrack.value = undefined
}

const saveSetup = async () => {
  console.log(files.value[fileImportOpen.value]?.carName)
  await window.fs.setupFile(
    files.value[fileImportOpen.value]?.carName,
    curSaveTrack.value?.value,
    fileSearch.value[fileImportOpen.value],
    JSON.stringify(files.value[fileImportOpen.value]),
  )
  closeFileSaveDialog()
}

const handleDragEnter = (side: 'left' | 'right') => {
  isDragging.value[side] = true
}

const handleDragLeave = (side: 'left' | 'right') => {
  isDragging.value[side] = false
}

const codeShareOpen = ref<String | undefined>(undefined)
const importSetup = (setup: any, fileName: string) => {
  if (codeShareOpen.value) {
    if (!getCarSeries(setup.carName)) {
      snackbar({
        message: translate('setup.invalidJSON'),
        autoCloseDelay: 3000,
      })
      return
    }
    if (!files.value[counterSide(codeShareOpen.value)]) {
      const carSeries = getCarSeries(setup.carName)
      if (carSeries) {
        curGroup.value = carSeries
      }
    }
    files.value[codeShareOpen.value] = setup
    fileSearch.value[codeShareOpen.value] = fileName
  }
  codeShareOpen.value = undefined
}
</script>

<template>
  <div
    class="h-full flex flex-col justify-center items-center pb-8 relative w-full"
  >
    <input
      type="file"
      accept=".json"
      class="hidden"
      ref="leftFileInput"
      @change="handleFileSelect('left', $event)"
    />
    <input
      type="file"
      accept=".json"
      class="hidden"
      ref="rightFileInput"
      @change="handleFileSelect('right', $event)"
    />
    <mdui-card
      variant="outlined"
      class="size-full border border-[rgb(var(--mdui-color-inverse-primary-dark))] mx-4 mb-2 flex"
      :style="{
        background: `rgba(var(--mdui-color-surface-container-lowest), ${(0.65 * (store.settings.general.bgOpacity || 0.85)) / 0.85})`,
      }"
    >
      <div
        v-for="side in ['left', 'right']"
        :key="side"
        class="w-1/2 h-full relative"
        :class="{
          'ml-4 border-r border-[rgb(var(--mdui-color-surface-container-highest))]':
            side === 'left',
          'mr-4 border-l border-[rgb(var(--mdui-color-surface-container-highest))]':
            side === 'right',
          'border-none': isDragging['left'] || isDragging['right'],
        }"
      >
        <Transition name="scale">
          <div
            v-if="!files[side as Side]"
            class="w-full flex flex-col justify-center items-center my-4 absolute"
            style="height: calc(100% - 2rem)"
            :class="{
              'bg-[rgb(var(--mdui-color-primary-container))] rounded-lg':
                isDragging[side as Side],
            }"
            :style="{
              background: isDragging[side as Side]
                ? 'rgba(var(--mdui-color-primary-container), 0.5)'
                : 'transparent',
              borderRadius: isDragging[side as Side] ? '0.5rem' : '0',
            }"
            @dragenter.prevent="handleDragEnter(side as Side)"
            @dragleave.prevent="handleDragLeave(side as Side)"
            @dragover.prevent
            @drop.prevent="handleDrop(side as Side, $event)"
          >
            <div v-if="!isDragging[side as Side]" class="flex flex-col w-max">
              <mdui-button @click="triggerFileInput(side as Side)">
                {{ $t('setup.chooseFile') }}
              </mdui-button>
              <mdui-button
                @click="codeShareOpen = side"
                class="mt-3"
                variant="elevated"
              >
                {{ $t('setup.importFromCode') }}
              </mdui-button>
            </div>
            <mdui-icon-file-upload--rounded
              v-else
              class="pointer-events-none mb-4 text-4xl text-[rgb(var(--mdui-color-primary))]"
            ></mdui-icon-file-upload--rounded>
            <p class="text-sm text-gray-500 mt-2 pointer-events-none mb-14">
              {{
                isDragging[side as Side]
                  ? $t('setup.releaseToLoad')
                  : $t('setup.dragFile')
              }}
            </p>
          </div>
        </Transition>
        <Transition name="swipe">
          <SetupDisplay
            class="absolute"
            v-if="files[side as Side]"
            :setup="files[side as Side]"
            :side="side"
            v-model:scroll="setupScroll"
            v-model="setupOpenGroups"
            :carData="carData[curGroup]"
            :fileName="fileSearch[side as Side]"
            :compareSetup="files[counterSide(side) as Side]"
            @closeSetup="
              () => {
                files[side as Side] = undefined
                fileSearch[side as Side] = ''
                if (side === 'left') {
                  if (leftFileInput) {
                    leftFileInput.value = ''
                  }
                } else {
                  if (rightFileInput) {
                    rightFileInput.value = ''
                  }
                }
              }
            "
          />
        </Transition>
      </div>
    </mdui-card>

    <mdui-dialog
      :headline="$t('setup.importSetup')"
      :open="codeShareOpen"
      @close="() => {}"
    >
      <SetupCode
        :isOut="false"
        @importSetup="importSetup"
        class="w-[350px]"
        @closeDialog="codeShareOpen = undefined"
      />
    </mdui-dialog>

    <div
      class="absolute bottom-2 left-0 right-0 text-center text-gray-400 text-sm"
    >
      {{ $t('setup.techSupport') }}
      <img
        src="@/assets/DEA_light.png"
        class="inline px-1 py-0.5 mr-2 mb-0.5 rounded-full bg-[rgb(var(--mdui-color-primary-light))]"
        width="45"
      />
      |
      <mdui-tooltip>
        <ul slot="content" class="list-disc list-outside text-left pl-4">
          <li class="mb-2">{{ $t('setup.generalTip1') }}</li>
          <li class="mb-2">{{ $t('setup.generalTip2') }}</li>
          <li class="mb-2">{{ $t('setup.generalTip3') }}</li>
          <li class="mb-2">{{ $t('setup.generalTip4') }}</li>
          <li>
            {{ $t('setup.generalTip5')
            }}<a
              style="text-decoration: underline"
              :href="$t('setup.generalTipLink')"
              >{{ $t('setup.generalTipLink') }}</a
            >
          </li>
        </ul>
        <div
          class="general-tip inline transition-all ml-2 py-1 px-2 border rounded-full text-xs"
        >
          {{ $t('setup.hoverForGeneralTip') }}
        </div>
      </mdui-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
.swipe-enter-from,
.swipe-leave-to {
  transform: translateY(15vh);
  opacity: 0;
}

.scale-enter-active {
  transition: all 200ms var(--mdui-motion-easing-standard);
  transition-delay: 200ms;
}
.scale-leave-active {
  transition: all 200ms var(--mdui-motion-easing-standard);
}

.swipe-enter-active {
  transition: all 400ms var(--mdui-motion-easing-standard);
}
.swipe-leave-active {
  transition: all 300ms var(--mdui-motion-easing-standard);
}

::part(container) {
  background: transparent;
  border-radius: 999px;
  height: 50px;
}
::part(label) {
  color: rgb(var(--mdui-color-on-surface-invert));
}
::part(indicator) {
  background: rgb(var(--mdui-color-inverse-primary));
}
::part(content) {
  font-size: 0.9rem;
  line-height: 1.2;
}

.general-tip:hover {
  background: rgba(var(--mdui-color-secondary), 0.2);
}
</style>
