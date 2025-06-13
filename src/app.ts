import { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { defaultHook } from 'stoker/openapi';
import { cors } from 'hono/cors';

import packageJSON from '../package.json';

const app = new OpenAPIHono({
	strict: true,
	defaultHook,
}).basePath('/api');

app.use(
	'*',
	cors({
		origin: 'http://localhost:9999/api', // Replace with your frontend's origin
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
		allowHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Allow specific headers
	})
);

app.use('*', serveEmojiFavicon('📕'));

app.notFound(notFound);
app.onError(onError);

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
	return c.json({ message: "Congrats! You've deployed Hono to Vercel" });
});

export default app;
