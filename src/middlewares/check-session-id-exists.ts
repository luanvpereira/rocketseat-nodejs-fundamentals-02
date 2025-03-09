import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'

import { env } from '../env'

export async function checkSessionExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  const sessionData = jwt.verify(sessionId, env.AUTH_SECRET)

  request.sessionData = sessionData as {
    id: string
    email: string
    name: string
  }
}
