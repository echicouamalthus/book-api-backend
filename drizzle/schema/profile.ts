import { relations } from 'drizzle-orm';
import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import * as schema from '.';

// Table users adaptée pour PostgreSQL
export const profile = pgTable('profile', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	profileImage: text('profileImage').default(''),
	createAt: timestamp('createAt', { withTimezone: false })
		.notNull()
		.defaultNow(),
	updateAt: timestamp('updateAt', { withTimezone: false })
		.notNull()
		.defaultNow(),
});

export const usersRelations = relations(profile, ({ many }) => ({
	books: many(schema.books),
}));

const fullInsertSchema = createInsertSchema(profile, {
	password: z =>
		z
			.min(3, 'Password must be at least 3 charaters long')
			.max(15, 'Password must be at most 8 charaters long'),
	username: z =>
		z
			.min(3, 'Username must be at least 3 charaters long')
			.max(20, 'Username must be at most 20 charaters long'),
});

const fullSelectSchema = createSelectSchema(profile);

export const insertRegisterUserSchema = fullInsertSchema.omit({
	id: true,
	createAt: true,
	updateAt: true,
	profileImage: true,
});

export const type = fullInsertSchema.pick({
	username: true,
	email: true,
	password: true,
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
