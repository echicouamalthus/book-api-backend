import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import env from './src/env';

export default defineConfig({
	out: './drizzle/migrations',
	schema: './drizzle/schema/*',
	dialect: 'postgresql',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});