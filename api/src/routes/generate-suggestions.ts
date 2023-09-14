import { OpenAIStream, streamToResponse } from 'ai'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { openai, prisma } from '../lib'

export async function generateSuggestionsRoute(app: FastifyInstance) {
  app.post('/suggestions', async (request, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      temperature: z.number().min(0).max(1).default(0.5),
      prompt: z.string()
    })
    const { videoId, temperature, prompt } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId }
    })

    if (!video.transcription) {
      return reply
        .status(400)
        .send({ error: 'Video transcription was not generated yet.' })
    }

    const content = prompt.replace('{transcription}', video.transcription)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k-0613',
      temperature,
      messages: [{ role: 'user', content }],
      stream: true
    })

    const stream = OpenAIStream(response)

    streamToResponse(stream, reply.raw, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      }
    })
  })
}
