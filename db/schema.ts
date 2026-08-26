import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const results = sqliteTable('results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  answersJson: text('answers_json').notNull(),
  createdAt: text('created_at').notNull(),
});
