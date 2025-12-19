import tracks from '@/utils/trackData'
import { translate } from '@/i18n'
import { useStore } from '@/store'
import { trackCarDispSettings, trackIndex } from '@/utils/enums'
import carData from '@/utils/carData'
import { nextTick } from 'vue'
import * as brotli from 'brotli-compress'

export const obj2Param = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === undefined || value === null) return ''
      if (typeof value === 'object') {
        return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .filter(Boolean)
    .join('&')
}

export const getTrack = (trackId: string, by = trackIndex.ID) => {
  return tracks.find(
    (t: string[]) =>
      t[by] === (by === trackIndex.ID ? trackId.toLowerCase() : trackId),
  )
}

export const getTrackDisplay = (trackId: string, by = trackIndex.ID) => {
  const store = useStore()
  const res = getTrack(trackId, by)

  if (store.settings.setup.trackDisplay == trackCarDispSettings.LOCAL) {
    return translate(`tracks.${res?.[trackIndex.ID]}`)
  } else {
    return res?.[
      [trackIndex.FULL, trackIndex.SHORT][
        store.settings.setup.trackDisplay - 1
      ] ?? trackIndex.FULL
    ]
  }
}

export const getCarDisplay = (car: [string, any]) => {
  if (!car) return ''
  const store = useStore()

  if (store.settings.setup.carDisplay == trackCarDispSettings.LOCAL) {
    return translate(`cars.${car?.[0]}`)
  } else {
    if (car?.[1]) {
      return car[1][
        ['name', 'shortName'][store.settings.setup.carDisplay - 1] ?? 'name'
      ]
    } else {
      for (const series of Object.values(carData) as any[]) {
        if (series[car[0]]) {
          return series[car[0]][
            ['name', 'shortName'][store.settings.setup.carDisplay - 1] ?? 'name'
          ]
        }
      }
    }
  }
  return ''
}

export const getCarById = (carId: number) => {
  for (const series of Object.values(carData) as any[]) {
    for (const [key, car] of Object.entries(series) as [string, any][]) {
      if (car.id === carId) {
        return [key, car] as [string, any]
      }
    }
  }
  return undefined
}

export const getCarByKey = (key: string) => {
  for (const series of Object.values(carData) as any[]) {
    for (const [carKey, car] of Object.entries(series) as [string, any][]) {
      if (carKey === key) {
        return car
      }
    }
  }
  return undefined
}

export const getCarDisplayById = (carId: number) => {
  return getCarDisplay(getCarById(carId) as [string, any])
}

export const json2Preset = (json: Record<string, any>) => {
  return Object.entries(json)
    .map(
      ([key, value]) =>
        `#${key}\r\n${JSON.stringify(value, null, 2).replace(/\n/g, '\r\n')}`,
    )
    .join('\r\n\r\n')
}

export const formatBopData = (bop: any[]) => {
  const entries = []
  for (const trackBop of bop) {
    const track = tracks.find(
      it => it[trackIndex.LFM] === trackBop.track_name,
    )?.[trackIndex.ID]
    for (const car of trackBop.bop.GT3.concat(trackBop.bop.GT4)) {
      entries.push({
        track,
        carModel: car.car_model,
        ballastKg: car.ballast,
        restrictor: car.restrictor,
      })
    }
  }

  return { entries }
}

export const isHipole = (name: string) => {
  if (name.startsWith('HiPole.com | ') && name.length >= 16) {
    const event = name.split(' | ')?.[1]?.substring?.(0, 3)
    return ['RCC', 'TTC', 'MCC', 'RWC', 'Thr'].includes(event ?? '')
      ? event
      : undefined
  }
  return undefined
}

export const connectServer = (ip: string, tcpPort: number, name: string) => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = `https://lonemeow.github.io/acc-connector/?hostname=${ip}&port=${tcpPort}&name=${encodeURIComponent(name)}&persistent=true`
  document.body.appendChild(iframe)
  iframe.onload = () => {
    nextTick(() => {
      document.body.removeChild(iframe)
    })
  }
}

export const sortCars = (group: 'GT3' | 'GT4' | 'TCX' | 'GTC' = 'GT3') => {
  const store = useStore()
  const favCars = store.general.favCars[group]
  const list = Object.entries(carData[group])
  return list.sort((a: [string, any], b: [string, any]) => {
    const aFav = favCars.includes(a[0]) ? 0 : 1
    const bFav = favCars.includes(b[0]) ? 0 : 1
    if (aFav !== bFav) {
      return aFav - bFav
    }

    const aComp = a[1].competitive ? 0 : 1
    const bComp = b[1].competitive ? 0 : 1
    if (aComp !== bComp) {
      return aComp - bComp
    }

    return getCarDisplay(a) - getCarDisplay(b)
  })
}

export const sortTracks = () => {
  const store = useStore()
  const favTracks = store.general.favTracks
  return tracks.slice().sort((a, b) => {
    const aFav = favTracks.includes(a[trackIndex.ID] ?? '') ? 0 : 1
    const bFav = favTracks.includes(b[trackIndex.ID] ?? '') ? 0 : 1
    if (aFav !== bFav) {
      return aFav - bFav
    }
    return (getTrackDisplay(a[trackIndex.ID] ?? '') ?? '') >
      (getTrackDisplay(b[trackIndex.ID] ?? '') ?? '')
      ? 1
      : -1
  })
}

export const launchSteam = (id: string) => {
  window.open(`steam://rungameid/${id}`, '_blank')
}

export const brotliCompress = async (input: string) => {
  const encoded = new TextEncoder().encode(input)
  const compressed = await brotli.compress(encoded)
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(compressed))))
}

export const brotliDecompress = async (input: string) => {
  const buf = Uint8Array.from(atob(input), c => c.charCodeAt(0))
  const decompressed = await brotli.decompress(buf)
  return new TextDecoder().decode(decompressed)
}
