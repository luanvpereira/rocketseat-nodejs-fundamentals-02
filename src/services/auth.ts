import jwt from 'jsonwebtoken'

import { env } from '../env'

export function signUser<T>(payload: T) {
  const parsedPayload = JSON.stringify(payload)

  return new Promise((resolve, reject) => {
    jwt.sign(parsedPayload, env.AUTH_SECRET, (error, token) => {
      if (token) resolve(token)
      else reject(error)
    })
  })
}
