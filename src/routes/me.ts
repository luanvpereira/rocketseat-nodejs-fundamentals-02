import { FastifyInstance } from 'fastify'

import { checkSessionExists } from '../middlewares/check-session-id-exists'

import { knex } from '../database'

export async function meRoutes(app: FastifyInstance) {
  app.get(
    '/stats',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const { id } = request.sessionData

      const onDiet = await knex('meals')
        .count('is_part_of_diet', { as: 'on_diet' })
        .where({
          user_id: id,
          is_part_of_diet: true,
        })
        .first()

      const offDiet = await knex('meals')
        .count('is_part_of_diet', { as: 'off_diet' })
        .where({
          user_id: id,
          is_part_of_diet: false,
        })
        .first()

      const amountOfMeals = await knex('meals')
        .count('*', { as: 'amount_of_meals' })
        .where({
          user_id: id,
        })
        .first()

      const allMeals = await knex('meals')
        .where({
          user_id: id,
        })
        .select('is_part_of_diet')

      let maxInsideDiet = 0
      let insideDiet = 0

      for (const meal of allMeals) {
        if (meal.is_part_of_diet) {
          insideDiet++
        } else {
          insideDiet = 0
        }

        if (insideDiet > maxInsideDiet) {
          maxInsideDiet = insideDiet
        }
      }

      const response = {
        onDiet: onDiet?.on_diet,
        offDiet: offDiet?.off_diet,
        amountOfMeals: amountOfMeals?.amount_of_meals,
        bestSequenceOnDiet: maxInsideDiet,
        onDietPercentage:
          (Number(onDiet?.on_diet ?? 0) * 100) /
          Number(amountOfMeals?.amount_of_meals ?? 1),
      }

      return reply.status(200).send(response)
    },
  )
}
