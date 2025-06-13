import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import * as schema from './';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const books = sqliteTable('books', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	caption: text('caption').notNull(),
	title: text('title').notNull(),
	rating: integer('rating').notNull().default(1), // rating from 1 to 5
	image: text('image').default(''),
	userId: integer('userId')
		.notNull()
		.references(() => schema.users.id, { onDelete: 'cascade' }),
	createAt: integer('createdAt')
		.notNull()
		.default(sql`(strftime('%s','now'))`),
	updateAt: integer('updatedAt')
		.notNull()
		.default(sql`(strftime('%s','now'))`),
});

export const booksRelations = relations(books, ({ one }) => ({
	users: one(schema.users, {
		fields: [books.userId],
		references: [schema.users.id],
	}),
}));

const fullSelectSchema = createSelectSchema(books);
const fullInsertSchema = createInsertSchema(books, {
	rating: z =>
		z.max(5, 'Rating must be at most 5').min(0, 'Rating must be at least 1'),
});

export const insertBookSchema = fullInsertSchema.omit({
	id: true,
	createAt: true,
	updateAt: true,
});

export const selectBookSchema = fullSelectSchema.omit({
	userId: true,
	id: true,
	createAt: true,
	updateAt: true,
});
