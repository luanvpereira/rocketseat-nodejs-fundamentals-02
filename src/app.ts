import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { ZodError, type ZodIssue } from 'zod'

import { usersRoute } from './routes/users'
import { authRoute } from './routes/auth'
import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)
app.register(usersRoute, {
  prefix: 'users',
})
app.register(authRoute, {
  prefix: 'auth',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Validation error',
      errors: JSON.parse(error.message).map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }
})
