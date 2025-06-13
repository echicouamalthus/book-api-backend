import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import * as schema from './';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	profileImage: text('profileImage').default(''),
	createAt: integer('createAt')
		.notNull()
		.default(sql`(strftime('%s','now'))`),
	updateAt: integer('updateAt')
		.notNull()
		.default(sql`(strftime('%s','now'))`),
});

export const usersRelations = relations(users, ({ many }) => ({
	books: many(schema.books),
}));

const fullInsertSchema = createInsertSchema(users, {
	password: z =>
		z
			.min(3, 'Password must be at least 3 charaters long')
			.max(15, 'Password must be at most 8 charaters long'),
	username: z =>
		z
			.min(3, 'Username must be at least 3 charaters long')
			.max(20, 'Username must be at most 20 charaters long'),
});

const fullSelectSchema = createSelectSchema(users);

export const insertRegisterUserSchema = fullInsertSchema.omit({
	id: true,
	createAt: true,
	updateAt: true,
	profileImage: true,
});

export const insertLoginUserSchema = fullInsertSchema.omit({
	id: true,
	createAt: true,
	updateAt: true,
	profileImage: true,
	username: true,
});

export const selectUserschema = fullSelectSchema.omit({
	password: true,
	createAt: true,
	updateAt: true,
});
