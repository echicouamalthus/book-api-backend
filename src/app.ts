import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { defaultHook } from 'stoker/openapi';
import { cors } from 'hono/cors';

import packageJSON from '../package.json';
import { app as authRoute } from './routes/auth.route';
import { app as bookRoute } from '../src/routes/book.route';
import env from './env';

const app = new OpenAPIHono({
	strict: true,
	defaultHook,
}).basePath('/api');

app.use(
	'*',
	cors({
		origin:
			env.NODE_ENV === 'production'
				? env.BASE_API_URL
				: 'http://localhost:9999', // Replace with your frontend's origin
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
		allowHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Allow specific headers
		credentials: true,
	})
);

app.use('*', serveEmojiFavicon('📕'));

app.notFound(notFound);
app.onError(onError);

app.route('/auth', authRoute);
app.route('/book', bookRoute);

app.doc('/doc', {
	openapi: '3.0.0',
	info: {
		title: 'Book Api Documentation',
		version: packageJSON.version,
		description: 'Book Api Documentation',
		contact: {
			name: 'Echicoua Elie Malthus',
			email: 'echicouamalthus@gmail.com',
		},
	},
});

app.get('/', c => {
	return c.json({
		message: `Bienvenue sur l'API Book ! Ce projet gère une bibliothèque de livres avec Hono, TypeScript et OpenAPI.`,
		url: 'https://www.youtube.com/',
	});
});

export default app;
