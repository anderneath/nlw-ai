import { FastifyInstance } from 'fastify'
import { createReadStream } from 'fs'
import { z } from 'zod'
import { openai, prisma } from '../lib'

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (request) => {
    const paramsSchema = z.object({ videoId: z.string().uuid() })
    const bodySchema = z.object({ prompt: z.string(), temperature: z.number() })
    const { videoId } = paramsSchema.parse(request.params)
    const { prompt } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId
      }
    })

    const stream = createReadStream(video.path)

    const response = await openai.audio.transcriptions.create({
      file: stream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt
    })

    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId
      },
      data: {
        transcription
      }
    })

    return {
      transcription
    }
  })
}
