import { pgTable, integer, text, serial, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import * as schema from './';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Table books en PostgreSQL
export const books = pgTable('books', {
	id: serial('id').primaryKey(),
	caption: text('caption').notNull(),
	title: text('title').notNull(),
	rating: integer('rating').notNull().default(1), // rating from 1 to 5
	image: text('image').default(''),
	userId: integer('userId')
		.notNull()
		.references(() => schema.profile.id, { onDelete: 'cascade' }),
	createAt: timestamp('createdAt', { withTimezone: false })
		.notNull()
		.defaultNow(),
	updateAt: timestamp('updatedAt', { withTimezone: false })
		.notNull()
		.defaultNow(),
});

export const booksRelations = relations(books, ({ one }) => ({
	users: one(schema.profile, {
		fields: [books.userId],
		references: [schema.profile.id],
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
