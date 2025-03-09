import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import cookie from '@fastify/cookie'

import bcrypt from 'bcrypt'

import { knex } from '../database'
import { signUser } from '../services/auth'

export async function authRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.post('/login', async (request, reply) => {
    const authBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = authBodySchema.parse(request.body)

    let user

    try {
      user = await knex('users')
        .where({
          email,
        })
        .first()

      if (!user) {
        return reply.status(401).send()
      }
    } catch {
      return reply.status(500).send()
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return reply.status(401).send()
    }

    const { password: _password, ...restUser } = user

    try {
      const userToken = await signUser(restUser)

      const sessionId = cookie.serialize('sessionId', userToken as string, {
        maxAge: 60 * 60,
        path: '/',
      })

      return reply.status(200).header('Set-Cookie', sessionId).send(restUser)
    } catch {
      return reply.status(401).send()
    }
  })
}
