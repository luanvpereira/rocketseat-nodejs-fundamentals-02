import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/hello', async () => {
  // const transaction = knex('transactions')
  //   .insert({
  //     id: crypto.randomUUID(),
  //     title: 'Transação de teste.',
  //     amount: 15,
  //   })
  //   .returning('*')

  // return transaction

  const transactions = knex('transactions')
    .where({
      amount: 15,
    })
    .select('*')

  return transactions
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
