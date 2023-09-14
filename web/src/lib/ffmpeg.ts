import { FFmpeg } from '@ffmpeg/ffmpeg'

import { toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null

export async function getFFmpeg() {
  if (ffmpeg) {
    return ffmpeg
  }

  ffmpeg = new FFmpeg()

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'

  const coreURL = await toBlobURL(
    `${baseURL}/ffmpeg-core.js`,
    'text/javascript'
  )
  const wasmURL = await toBlobURL(
    `${baseURL}/ffmpeg-core.wasm`,
    'application/wasm'
  )

  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL,
      wasmURL
    })
  }

  return ffmpeg
}
