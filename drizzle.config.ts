import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import env from './src/env';

export default defineConfig({
	out: './drizzle/migrations',
	schema: './drizzle/schema/*',
	dialect: 'sqlite',
	dbCredentials: {
		url: env.DB_FILE_NAME,
	},
});
