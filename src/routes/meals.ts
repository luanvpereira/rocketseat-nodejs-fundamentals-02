import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { randomUUID } from 'node:crypto'

import { checkSessionExists } from '../middlewares/check-session-id-exists'

import { knex } from '../database'

function isDateValid(dateStr: string) {
  return !isNaN(Date.parse(dateStr))
}

const getMealsParamsSchema = z.object({
  id: z.string().uuid(),
})

const mealBodySchema = z.object({
  name: z.string({
    required_error: 'Name is required',
  }),
  description: z.string({
    required_error: 'Description is required',
  }),
  is_part_of_diet: z.boolean().default(true),
  time: z
    .string({
      required_error: 'Time is required',
    })
    .refine(isDateValid, {
      message: 'Time is not valid',
    }),
})

export function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      try {
        const meals = await knex('meals').where({
          user_id: request.sessionData.id,
        })

        const transformedMeals = meals.map((meal) => {
          const {
            user_id: _userId,
            created_at: _createdAt,
            updated_at: _updatedAt,
            ...restMeal
          } = meal

          return restMeal
        })

        return reply.status(200).send(transformedMeals)
      } catch (error) {
        console.error(error)
        return reply.status(500).send()
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const { id } = getMealsParamsSchema.parse(request.params)

      try {
        const [meal] = await knex('meals').where({
          id,
          user_id: request.sessionData.id,
        })

        const {
          user_id: _userId,
          created_at: _createdAt,
          updated_at: _updatedAt,
          ...restMeal
        } = meal

        return reply.status(200).send(restMeal)
      } catch (error) {
        console.error(error)
        return reply.status(500).send()
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const {
        name,
        description,
        is_part_of_diet: isPartOfDiet = true,
        time,
      } = mealBodySchema.parse(request.body)

      try {
        const response = await knex('meals')
          .insert({
            id: randomUUID(),
            user_id: request.sessionData.id,
            name,
            description,
            is_part_of_diet: isPartOfDiet,
            time,
          })
          .returning(['id', 'name', 'description', 'is_part_of_diet', 'time'])

        const meal = response?.[0]

        meal.is_part_of_diet = !!meal.is_part_of_diet

        return reply.status(201).send(meal)
      } catch (error) {
        console.log('error', error)
        return reply.status(500).send({
          error: 'Internal Server Error',
        })
      }
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const { id } = getMealsParamsSchema.parse(request.params)

      const {
        name,
        description,
        is_part_of_diet: isPartOfDiet = true,
        time,
      } = mealBodySchema.parse(request.body)

      try {
        const response = await knex('meals')
          .update({
            name,
            description,
            is_part_of_diet: isPartOfDiet,
            time,
          })
          .where({
            id,
            user_id: request.sessionData.id,
          })
          .returning(['id', 'name', 'description', 'is_part_of_diet', 'time'])

        const meal = response?.[0]

        meal.is_part_of_diet = !!meal.is_part_of_diet

        return reply.status(200).send(meal)
      } catch (error) {
        console.log('error', error)
        return reply.status(500).send({
          error: 'Internal Server Error',
        })
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const { id } = getMealsParamsSchema.parse(request.params)

      try {
        await knex('meals').delete().where({
          id,
          user_id: request.sessionData.id,
        })

        return reply.status(200).send()
      } catch (error) {
        console.log('error', error)
        return reply.status(500).send({
          error: 'Internal Server Error',
        })
      }
    },
  )
}
