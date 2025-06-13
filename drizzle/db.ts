import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import env from '../src/env';
import * as schema from './schema';

const sql = neon(env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export default db;
