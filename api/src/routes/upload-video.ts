import { fastifyMultipart } from '@fastify/multipart'
import { FastifyInstance } from "fastify"
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { prisma } from '../lib/prisma'


const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1048576 * 25
        }
    })
    app.post("/videos", async (request, reply) => {
        const data = await request.file()
        if (!data) {
            return reply.status(400).send({error: 'Missing video file'})
        }
        const extension = path.extname(data.filename)

        if (extension !== '.mp3') {
            return reply.status(400).send({error:"Invalid file type, MP3 required."})
        }
        const basename = path.basename(data.filename, extension)
        const filename = `${basename}-${randomUUID()}${extension}`
        const destination = path.resolve(__dirname, '../../tmp', filename)
        await pump(data.file, fs.createWriteStream(destination))

        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: destination
            }
        })

        return reply.status(201).send(video)
    })
}