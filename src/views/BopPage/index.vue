<script setup lang="ts">
import { type ComputedRef, inject, onMounted, ref, watch } from 'vue'
import ScrollWrapper from '@/components/ScrollWrapper.vue'
import { trackIndex } from '@/utils/enums'
import {
  formatBopData,
  getCarById,
  getCarDisplayById,
  getTrack,
  getTrackDisplay,
  json2Preset,
} from '@/utils/utils'
import { useStore } from '@/store'
import CarSelector from '@/components/CarSelector.vue'
import carData from '@/utils/carData.ts'
import '@mdui/icons/save--rounded.js'
// import PresetDialog from '@/views/BopPage/components/PresetDialog.vue'
import TrackSelector from '@/components/TrackSelector.vue'
import ChipSelect from '@/components/ChipSelect.vue'
import presetTemplate from './components/presetTemplate'

const store = useStore()

const bopData = ref<any>(null)
const curCategoryMethod = ref('byTrack')
const curTrack = ref<any>({
  value: 'Circuit de Catalunya',
  label: getTrackDisplay('barcelona'),
})
const curCar = ref<any>(null)
const curSeries = ref('GT3')
const loading = ref(true)
const error = ref(false)
// const saveDialogShow = ref(false)

const isMobile = inject('isMobile') as ComputedRef<boolean>
const series = ['GT3', 'GT4']

const defaultGT3 = {
  value: 'amr_v8_vantage_gt3',
  label: getCarDisplayById(20),
}
const defaultGT4 = {
  value: 'alpine_a110_gt4',
  label: getCarDisplayById(50),
}

const curGT3 = ref(defaultGT3)
const curGT4 = ref(defaultGT4)

const targetLap = ref('')
const targetLapLoading = ref(false)

watch(
  curSeries,
  newVal => {
    if (newVal === 'GT3') {
      curGT4.value = curCar.value || defaultGT4
      curCar.value = curGT3.value
    } else {
      curGT3.value = curCar.value || defaultGT3
      curCar.value = curGT4.value
    }
  },
  { immediate: true },
)

const { isDark } = inject('isDark') as {
  isDark: any
  setDark: (val: boolean) => void
}

const queryLap = () => {
  targetLapLoading.value = true
  fetch(
    `https://api3.lowfuelmotorsport.com/api/hotlaps/getBopPrediction?track=${getTrack(curTrack.value?.value, trackIndex.LFM)?.[trackIndex.ID_NUM]}&class=${curSeries.value}&major=1.10`,
  )
    .then(resp => resp.json())
    .then(data => {
      targetLap.value = data?.bopdata?.target_time || ''
      const relevant = (data?.laps_relevant ?? []) as []
      const others = (data?.laps_others ?? []) as []
      const bopItem = bopData.value?.find?.(
        (it: any) => it.track_name === curTrack.value?.value,
      )
      ;[...relevant, ...others].forEach((it: any) => {
        bopItem?.bop?.[curSeries.value]?.forEach((car: any) => {
          if (car.car_model === it.car_id) {
            car.target_lap = it.lap
          }
        })
      })
    })
    .finally(() => {
      targetLapLoading.value = false
    })
}

const queryData = () => {
  loading.value = true
  error.value = false
  fetch('https://api3.lowfuelmotorsport.com/api/hotlaps/getAccBop')
    .then(resp => resp.json())
    .then(data => {
      bopData.value = data
    })
    .catch(() => {
      error.value = true
    })
    .finally(() => {
      loading.value = false
    })
}

const savePre = () => {
  let preset: Record<string, any> = presetTemplate
  preset.BOP = formatBopData(bopData.value)
  let content = json2Preset(preset)

  var aLink = document.createElement('a')
  var blob = new Blob([content])
  aLink.download = 'preset.pre'
  aLink.href = URL.createObjectURL(blob)
  aLink.click()
}

const saveJson = () => {
  var aLink = document.createElement('a')
  var blob = new Blob([JSON.stringify(formatBopData(bopData.value), null, 2)])
  aLink.download = `bop_${curSeries.value}.json`
  aLink.href = URL.createObjectURL(blob)
  aLink.click()
}

onMounted(() => {
  queryData()
})

watch([curTrack, curSeries], () => {
  targetLap.value = ''
})
</script>

<template>
  <div class="h-full flex flex-col justify-center items-center relative w-full">
    <mdui-card
      :variant="isMobile ? 'filled' : 'outlined'"
      :class="
        isMobile
          ? 'size-full flex flex-col'
          : 'size-full border border-[rgb(var(--mdui-color-inverse-primary-dark))] mx-4 mb-4 flex flex-col'
      "
      :style="{
        background: `rgba(var(--mdui-color-surface-container-lowest), ${(0.65 * (store.settings.general.bgOpacity || 0.85)) / 0.85})`,
      }"
    >
      <div class="flex flex-row justify-between items-baseline mx-6 mt-4">
        <div class="flex flex-row flex-wrap items-center">
          <TrackSelector
            v-if="curCategoryMethod === 'byTrack'"
            v-model="curTrack"
            dropdown-placement="bottom"
            chip-class="border border-[rgb(var(--mdui-color-outline-variant))] mr-2"
            :key-idx="trackIndex.LFM"
          />
          <CarSelector
            v-else
            v-model="curCar"
            :group="curSeries"
            dropdown-placement="bottom"
            chip-class="border border-[rgb(var(--mdui-color-outline-variant))] mr-2"
          />
          <mdui-radio-group
            :value="curCategoryMethod"
            class="h-10"
            @change="curCategoryMethod = $event.target.value"
          >
            <mdui-radio value="byTrack">{{ $t('bop.byTrack') }}</mdui-radio>
            <mdui-radio value="byCar">{{ $t('bop.byCar') }}</mdui-radio>
          </mdui-radio-group>
        </div>
        <div class="flex flex-row items-center">
          <div
            v-if="curCategoryMethod === 'byTrack' && !isMobile"
            class="flex flex-row items-center"
          >
            <div>{{ $t('bop.trackTargetLap') }}</div>
            <mdui-button
              variant="outlined"
              v-if="!targetLap && !targetLapLoading"
              @click="queryLap"
              >{{ $t('bop.clickToView') }}</mdui-button
            >
            <mdui-circular-progress
              v-if="targetLapLoading"
              class="w-5 h-5 mx-3"
            ></mdui-circular-progress>
            <div
              class="title font-bold ml-2"
              v-if="targetLap && !targetLapLoading"
            >
              {{ targetLap }}
            </div>
          </div>
          <div v-else class="flex flex-row items-center">
            <div>&nbsp;</div>
          </div>
          <mdui-dropdown trigger="hover">
            <mdui-button-icon class="mr-2" slot="trigger" :disabled="loading">
              <mdui-icon-save--rounded></mdui-icon-save--rounded>
            </mdui-button-icon>
            <mdui-menu>
              <mdui-menu-item @click="saveJson">{{
                $t('bop.saveAsJson')
              }}</mdui-menu-item>
              <mdui-menu-item @click="savePre">{{
                $t('bop.saveAsPre')
              }}</mdui-menu-item>
            </mdui-menu>
          </mdui-dropdown>

          <ChipSelect
            v-if="isMobile"
            v-model="curSeries"
            :items="series"
            chip-class="border border-[rgb(var(--mdui-color-outline-variant))] mr-2"
          />
          <mdui-segmented-button-group
            v-else
            :value="curSeries"
            class="rounded-full ml-4"
            selects="single"
            @change="curSeries = $event.target.value"
          >
            <mdui-segmented-button
              value="GT3"
              class="border border-[rgb(var(--mdui-color-outline-variant))]"
              >GT3</mdui-segmented-button
            >
            <mdui-segmented-button
              value="GT4"
              class="border border-[rgb(var(--mdui-color-outline-variant))]"
            >
              GT4
            </mdui-segmented-button>
          </mdui-segmented-button-group>
        </div>
      </div>

      <div
        class="flex flex-row justify-between mx-10 mt-2 title text-lg font-bold text-[rgb(var(--mdui-color-primary))]"
      >
        <div class="w-[30%] md:w-[50%]">
          {{
            curCategoryMethod === 'byTrack' ? $t('bop.car') : $t('bop.track')
          }}
        </div>
        <div class="w-[20%]" v-if="!isMobile">
          {{ curCategoryMethod === 'byTrack' ? $t('bop.bopLapPred') : '' }}
        </div>
        <div class="w-[20%] md:w-[10%]" v-if="!isMobile">
          {{ curCategoryMethod === 'byTrack' ? $t('bop.year') : '' }}
        </div>
        <div class="w-[25%] md:w-[10%]" :class="{ 'text-right': isMobile }">
          {{ $t('bop.restrictor') }}
        </div>
        <div class="w-[20%] md:w-[10%] text-right">{{ $t('bop.ballast') }}</div>
      </div>
      <mdui-divider class="mt-4 mx-6"></mdui-divider>

      <Transition name="fade" mode="out-in">
        <div
          v-if="loading || !bopData || error"
          class="size-full flex flex-row justify-center items-center absolute pt-[120px]"
        >
          <Transition name="fade" mode="out-in">
            <mdui-circular-progress v-if="loading"></mdui-circular-progress>
            <div v-else-if="!bopData || error">
              {{ $t('servers.noData') }}
            </div>
          </Transition>
        </div>
      </Transition>
      <Transition name="fade-up">
        <ScrollWrapper
          v-if="!loading && bopData && !error"
          :show-bar="isMobile ? 'always' : 'hover'"
        >
          <div class="pb-6" v-if="curCategoryMethod === 'byTrack'">
            <div
              class="flex flex-row justify-between mx-4 my-2 px-6 py-3 rounded-full"
              v-for="(bop, index) in bopData
                ?.find(it => it.track_name === curTrack?.value)
                ?.bop[curSeries].sort((a, b) => {
                  const carA = getCarById(a.car_model)
                  const carB = getCarById(b.car_model)

                  const favCars = store.general.favCars[curSeries]
                  const aFav = favCars.includes(carA?.[0]) ? 0 : 1
                  const bFav = favCars.includes(carB?.[0]) ? 0 : 1
                  if (aFav !== bFav) {
                    return aFav - bFav
                  }

                  const aComp = carA?.[1]?.competitive ? 0 : 1
                  const bComp = carB?.[1]?.competitive ? 0 : 1
                  if (aComp !== bComp) {
                    return aComp - bComp
                  }

                  return a.ballast - b.ballast
                })"
              :key="bop.car_model"
              :style="{
                background:
                  index & 1
                    ? 'rgba(var(--mdui-color-secondary-container), 0.4)'
                    : 'none',
              }"
            >
              <div class="w-[60%] md:w-[50%] flex flex-row items-center">
                <img
                  :src="`/carLogos/${getCarById(bop.car_model)?.[1]?.manufacturer}.png`"
                  class="w-6 h-6 mr-3"
                />
                <div>
                  {{
                    `${store.general.favCars[curSeries].includes(getCarById(bop.car_model)?.[0]) ? `★ ` : ''}${getCarDisplayById(bop.car_model) || bop.car_name}`
                  }}
                </div>
              </div>
              <div
                class="w-[20%]"
                v-if="(targetLap || targetLapLoading) && !isMobile"
              >
                {{ bop.target_lap || '-' }}
              </div>
              <div class="w-[20%]" v-else-if="!isMobile">
                <a
                  class="cursor-pointer"
                  @click="queryLap"
                  style="color: rgb(var(--mdui-color-primary))"
                  >{{ $t('bop.clickToView') }}</a
                >
              </div>
              <div v-if="!isMobile" class="w-[10%]">
                {{ bop.car_year }}
              </div>
              <div
                class="w-[10%]"
                :class="{
                  'text-orange-300': bop.restrictor > 0 && isDark,
                  'text-orange-500': bop.restrictor > 0 && !isDark,
                }"
              >
                {{ bop.restrictor ? `${bop.restrictor}%` : '-' }}
              </div>
              <div
                class="w-[20%] md:w-[10%] text-right"
                :class="{
                  'text-red-400': bop.ballast > 0 && isDark,
                  'text-red-500': bop.ballast > 0 && !isDark,
                  'text-green-400': bop.ballast < 0 && isDark,
                  'text-green-600': bop.ballast < 0 && !isDark,
                }"
              >
                {{ bop.ballast ? `${bop.ballast} kg` : '0' }}
              </div>
            </div>
          </div>
          <div class="pb-6" v-else>
            <div
              class="flex flex-row justify-between mx-4 my-2 px-6 py-3 rounded-full"
              v-for="(track, index) in bopData
                ?.map(it => {
                  const bopInfo = it.bop[curSeries].find(
                    bop =>
                      bop.car_model === carData[curSeries][curCar?.value]?.id,
                  )
                  return {
                    name: it.track_name,
                    restrictor: bopInfo?.restrictor,
                    ballast: bopInfo?.ballast,
                  }
                })
                ?.sort((a, b) => {
                  const favTracks = store.general.favTracks
                  const aFav = favTracks.includes(
                    getTrack(a.name, trackIndex.LFM)?.[trackIndex.ID],
                  )
                    ? 0
                    : 1
                  const bFav = favTracks.includes(
                    getTrack(b.name, trackIndex.LFM)?.[trackIndex.ID],
                  )
                    ? 0
                    : 1
                  if (aFav !== bFav) {
                    return aFav - bFav
                  }
                  return a.ballast - b.ballast
                })"
              :key="track.name"
              :style="{
                background:
                  index & 1
                    ? 'rgba(var(--mdui-color-secondary-container), 0.4)'
                    : 'none',
              }"
            >
              <div class="w-[50%]">
                {{
                  `${store.general.favTracks.includes(getTrack(track.name, trackIndex.LFM)?.[trackIndex.ID]) ? `★ ` : ''}${getTrackDisplay(track.name, trackIndex.LFM)}`
                }}
              </div>
              <div class="w-[10%] md:w-[30%]"></div>
              <div
                class="w-[10%]"
                :class="{
                  'text-orange-300': track.restrictor > 0 && isDark,
                  'text-orange-500': track.restrictor > 0 && !isDark,
                }"
              >
                {{ track.restrictor ? `${track.restrictor}%` : '-' }}
              </div>
              <div
                class="w-[20%] md:w-[10%] text-right"
                :class="{
                  'text-red-400': track.ballast > 0 && isDark,
                  'text-red-500': track.ballast > 0 && !isDark,
                  'text-green-400': track.ballast < 0 && isDark,
                  'text-green-600': track.ballast < 0 && !isDark,
                }"
              >
                {{ track.ballast ? `${track.ballast} kg` : '0' }}
              </div>
            </div>
          </div>
        </ScrollWrapper>
      </Transition>
    </mdui-card>

    <!--    <PresetDialog v-model="saveDialogShow" :bop="bopData" />-->
  </div>
</template>

<style scoped lang="scss">
.fade-up-enter-active,
.fade-up-appear-active {
  transition:
    transform 0.5s var(--mdui-motion-easing-standard),
    opacity 0.5s var(--mdui-motion-easing-standard);
}
.fade-up-leave-active {
  transition:
    transform 0.2s var(--mdui-motion-easing-standard),
    opacity 0.2s var(--mdui-motion-easing-standard);
  position: absolute; /* 防止离场时塌陷 */
  width: 100%;
  transition-delay: 0ms;
}

.fade-up-enter-from,
.fade-up-appear-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.fade-up-enter-to,
.fade-up-appear-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.fade-up-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
</style>
