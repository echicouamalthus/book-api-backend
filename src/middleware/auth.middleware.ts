// middlewares/protectRoute.ts
import { Context, MiddlewareHandler, Next } from 'hono';
import { verify } from 'hono/jwt';
import env from '../env';
import { getCookie } from 'hono/cookie';
import * as schema from '../../drizzle/schema';
import db from '../../drizzle/db';
import { eq } from 'drizzle-orm';

type jwtPayload = {
	id: string;
};

export const verifyJWT: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header('Authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!token) {
		return c.json({ message: 'access unauthorized, token missed' }, 401);
	}

	try {
		const payload = (await verify(token, env.JWT_SECRET)) as {
			id: number;
		};

		c.set('user', payload);

		await next();
	} catch (error) {
		return c.json({ message: 'Invalid or expired token' }, 401);
	}
};
// if (typeof decoded !== 'object' || !decoded.userId) {
// 	return c.json({ error: 'Invalid token' }, 401);
// }
