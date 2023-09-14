'use client'

import { api } from '@/lib/axios'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { FileVideo, Upload } from 'lucide-react'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import { Button, Label, Separator, Textarea } from '.'

enum Status {
  waiting = 'waiting',
  converting = 'converting',
  uploading = 'uploading',
  generating = 'generating',
  success = 'success'
}

const statusMessages = {
  converting: 'Convertendo...',
  uploading: 'Enviando...',
  generating: 'Transcrevendo...',
  success: 'Sucesso!'
}

export function VideoInputForm() {
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>(Status.waiting)
  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target

    if (!files) {
      return
    }

    setVideoFile(files[0])
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const prompt = promptInputRef.current?.value
    if (!videoFile || !prompt) {
      return
    }
    setStatus(Status.converting)
    const audioFile = await convertVideoToAudio(videoFile)
    const data = new FormData()
    data.append('file', audioFile)
    setStatus(Status.uploading)
    const response = await api.post('/videos', data)
    const videoId = response.data.id
    setStatus(Status.generating)
    await api.post(`/videos/${videoId}/transcription`, { prompt })
    setStatus(Status.success)
  }

  async function convertVideoToAudio(video: File){
    console.log('covert started')
    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    ffmpeg.on('progress', (progress) => {
      console.log('convert progress', Math.round(progress.progress * 100))
    })

    ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioBlob = new Blob([data], { type: 'audio/mpeg' })

    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' })

    return audioFile
  }

  const previewUrl = useMemo(() => {
    if (!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {previewUrl ? (
          <video
            src={previewUrl}
            controls={false}
            className="pointer-events-none"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea disabled={status != Status.waiting}
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>
      <Button disabled={status != Status.waiting} type="submit" className="w-full data-[success=true]:bg-emerald" data-success={status === Status.success}>
        {status === Status.waiting ? <>Carregar video
        <Upload className="w-4 h-4 ml-2" /></> : statusMessages[status]}
      </Button>
    </form>
  )
}
