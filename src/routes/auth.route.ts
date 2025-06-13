import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as HttpStatusCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import {
	insertLoginUserSchema,
	insertRegisterUserSchema,
	selectUserschema,
} from '../../drizzle/schema/profile';
import db from '../../drizzle/db';
import * as schema from '../../drizzle/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import env from '../env';
import { z } from 'zod';

const generateToken = async (userId: number) => {
	return await sign({ userId }, env.JWT_SECRET);
};

export const app = new OpenAPIHono();
// .basePath('/auth')
// .baseUrl(env.BASE_URL_API + '/auth')
// .title('Auth API')
// .version('1.0.0')
// .description('Auth API for the application')
// .contact({
//     name: 'Your Name',
//     email: ''})

const registerRoute = createRoute({
	method: 'post',
	summary: 'Register an new user',
	path: '/register',
	tags: ['auth'],
	request: {
		body: jsonContentRequired(insertRegisterUserSchema, 'create new User'),
	},
	responses: {
		[HttpStatusCode.CREATED]: jsonContent(
			z.object({
				token: z.string(),
				user: selectUserschema,
			}),
			'User created'
		),
		[HttpStatusCode.CONFLICT]: jsonContent(
			z.object({ message: z.string() }),
			'User already exists'
		),
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({ message: z.string() }),
			'Internal server error'
		),
	},
});

app.openapi(registerRoute, async c => {
	try {
		const { email, password, username } = c.req.valid('json');

		//check existing email or username
		const [existingUser] = await db
			.select()
			.from(schema.profile)
			.where(
				or(
					eq(schema.profile.email, email),
					eq(schema.profile.username, username)
				)
			)
			.limit(1);

		if (existingUser) {
			return c.json(
				{ message: 'user already exists' },
				HttpStatusCode.CONFLICT
			);
		}

		const hashedpassword = await bcrypt.hash(password, 10);
		const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username.trim()}`;

		const [user] = await db
			.insert(schema.profile)
			.values({
				email,
				password: hashedpassword,
				username,
				profileImage,
			})
			.returning({
				id: schema.profile.id,
				email: schema.profile.email,
				profileImage: schema.profile.profileImage,
				username: schema.profile.username,
			});

		const token = await generateToken(user.id);

		return c.json(
			{
				token,
				user: {
					id: user.id,
					email: user.email,
					profileImage: user.profileImage,
					username: user.username,
				},
			},
			HttpStatusCode.CREATED
		);
	} catch (err) {
		console.error('register error', err);
		return c.json(
			{
				message: 'Internal server error',
			},
			HttpStatusCode.INTERNAL_SERVER_ERROR
		);
	}
});

const loginRoute = createRoute({
	method: 'post',
	summary: 'Log in a user',
	path: '/login',
	tags: ['auth'],
	request: {
		body: jsonContentRequired(insertLoginUserSchema, 'user credentials'),
	},
	responses: {
		[HttpStatusCode.OK]: jsonContent(
			z.object({
				token: z.string(),
				user: selectUserschema,
			}),
			'user login successfully'
		),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(
			z.object({ message: z.string() }),
			'Invalid email or password'
		),
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'Internal server error'
		),
	},
});

app.openapi(loginRoute, async c => {
	try {
		const { email, password } = c.req.valid('json');

		// check if user exists
		const [user] = await db
			.select()
			.from(schema.profile)
			.where(eq(schema.profile.email, email))
			.limit(1);
		if (!user) {
			return c.json(
				{ message: 'Invalid email or password' },
				HttpStatusCode.UNAUTHORIZED
			);
		}

		// check if password is correct
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return c.json(
				{ message: 'Invalid email or password' },
				HttpStatusCode.UNAUTHORIZED
			);
		}

		const token = await generateToken(user.id);

		return c.json(
			{
				token,
				user: {
					id: user.id,
					email: user.email,
					profileImage: user.profileImage,
					username: user.username,
				},
			},
			HttpStatusCode.OK
		);
	} catch (error) {
		console.error('login error', error);
		return c.json(
			{
				message: 'Internal server error',
			},
			HttpStatusCode.INTERNAL_SERVER_ERROR
		);
	}
});
