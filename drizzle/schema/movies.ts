import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';

export const movies = pgTable('movies', {
	id: serial('id').primaryKey(),
	title: text('name'),
	releaseYear: integer('release_year'),
});
