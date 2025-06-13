// middlewares/protectRoute.ts
import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import env from '../env';

export const protectRoute: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header('Authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!token) {
		return c.json({ message: 'access unauthorized, token missed' }, 401);
	}

	try {
		const decoded = await verify(token, env.JWT_SECRET);

		if (typeof decoded !== 'object' || !decoded.userId) {
			return c.json({ error: 'Invalid token' }, 401);
		}

		c.set('userId', decoded.userId); // tu peux récupérer dans ta route avec c.get('user')

		await next();
	} catch (error) {
		return c.json({ message: 'Invalid or expired token' }, 401);
	}
};
