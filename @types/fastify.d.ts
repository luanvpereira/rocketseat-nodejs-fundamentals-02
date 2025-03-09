export * from 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    sessionData: {
      id: string
      email: string
      name: string
    }
  }
}
