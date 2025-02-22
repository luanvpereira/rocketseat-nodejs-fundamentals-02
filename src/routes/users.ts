import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

import bcrypt from 'bcrypt'

export async function usersRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.post('/', async (request) => {
    const createUserBodySchema = z.object({
      email: z.string().email(),
      name: z.string(),
      password: z.string(),
    })

    const { email, name, password } = createUserBodySchema.parse(request.body)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await knex('users').insert({
      id: randomUUID(),
      email,
      name,
      password: hashedPassword,
    })

    return {
      user,
    }
  })
}
