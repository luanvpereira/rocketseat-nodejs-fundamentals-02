import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').references('id').inTable('users').notNullable()

    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()

    table.string('name').notNullable()
    table.text('description').notNullable()

    table.boolean('is_part_of_diet').notNullable()
    table.boolean('time').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('meals')
}
