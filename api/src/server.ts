import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
    generateSuggestionsRoute,
    listPromptsRoute,
    uploadVideoRoute
} from './routes'
import { createTranscriptionRoute } from './routes/create-transcription'

const port = parseInt(process.env.PORT || '3333')

const app = fastify()

app.register(fastifyCors, {
  origin: '*'
})

app.register(listPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateSuggestionsRoute)

app.listen({ port }).then(() => {
  console.log(`Server started on port ${port}`)
})
