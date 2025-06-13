import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import env from '../src/env';
import * as schema from './schema';

const client = createClient({ url: env.DB_FILE_NAME });

const db = drizzle(client, { schema });

export default db;