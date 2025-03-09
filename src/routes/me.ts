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

      const stats = await knex('meals')
        .select([
          knex.raw('COUNT(*) AS amountOfMeals'),
          knex.raw('SUM(is_part_of_diet = true) AS onDiet'),
          knex.raw('SUM(is_part_of_diet = false) AS offDiet'),
          knex.raw(
            'ROUND(100.0 * SUM(is_part_of_diet = true) / COUNT(*), 2) AS onDietPercentage',
          ),
        ])
        .first()

      const allMeals = await knex('meals')
        .where({
          user_id: id,
        })
        .orderBy('created_at', 'asc')

      let maxInsideDiet = 0
      let insideDiet = 0

      for (const meal of allMeals) {
        if (meal.is_part_of_diet) {
          insideDiet++
          maxInsideDiet = Math.max(maxInsideDiet, insideDiet)
        } else {
          insideDiet = 0
        }
      }

      const response = {
        ...stats,
        bestStreak: maxInsideDiet,
      }

      return reply.status(200).send(response)
    },
  )
}
