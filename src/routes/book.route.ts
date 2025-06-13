import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { insertBookSchema, selectBookSchema } from '../../drizzle/schema/books';
import * as HttpStatusCode from 'stoker/http-status-codes';
import cloudinary from '../lib/cloudinary';
import { z } from 'zod';
import * as schema from '../../drizzle/schema';
import db from '../../drizzle/db';
import { protectRoute } from '../middleware/auth.middleware';
import { count, eq } from 'drizzle-orm';
import { IdParamsSchema } from 'stoker/openapi/schemas';

export const app = new OpenAPIHono();

app.use('/*', protectRoute);

const createBookRoute = createRoute({
	method: 'post',
	summary: 'create a new book',
	path: '/',
	tags: ['book'],
	request: {
		body: jsonContentRequired(insertBookSchema, 'create new book'),
	},
	responses: {
		[HttpStatusCode.CREATED]: jsonContent(selectBookSchema, 'Book created'),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(
			z.object({ message: z.string() }),
			'required credentials'
		),
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({ message: z.string() }),
			'Internal server error'
		),
	},
});

app.openapi(createBookRoute, async c => {
	try {
		const { caption, title, rating, image } = await c.req.valid('json');
		const userId = c.get('userId') as number;

		if (!userId) {
			return c.json(
				{ message: 'User Id is required' },
				HttpStatusCode.UNAUTHORIZED
			);
		}

		if (!image) {
			return c.json(
				{ message: 'Image is required' },
				HttpStatusCode.UNAUTHORIZED
			);
		}
		const uploadResponse = await cloudinary.uploader.upload(image);
		const imageUrl = uploadResponse.secure_url;

		const [book] = await db
			.insert(schema.books)
			.values({
				caption,
				title,
				rating,
				image: imageUrl,
				userId,
			})
			.returning();

		return c.json(book, HttpStatusCode.CREATED);
	} catch (error) {
		console.error('create book error', error);
		return c.json(
			{ message: 'Internal server error' },
			HttpStatusCode.INTERNAL_SERVER_ERROR
		);
	}
});

const getAllBooksRoute = createRoute({
	method: 'get',
	summary: 'Get all books',
	path: '/',
	tags: ['book'],
	request: {
		query: z.object({
			page: z.string().optional(),
			limit: z.string().optional(),
		}),
	},
	responses: {
		[HttpStatusCode.OK]: jsonContent(
			z.object({
				books: z.array(selectBookSchema),
				currentPage: z.number(),
				totalBooks: z.number(),
				totalPage: z.number(),
			}),
			'List of books'
		),
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'Internal server error'
		),
	},
});

app.openapi(getAllBooksRoute, async c => {
	try {
		const query = await c.req.valid('query');
		const page = Number(query.page || 1);
		const limit = Number(query.limit || 5);
		const skip = (page - 1) * limit;

		const books = await db
			.select()
			.from(schema.books)
			.orderBy(schema.books.createAt)
			.limit(limit)
			.offset(skip);

		const [{ count: totalCount }] = await db
			.select({ count: count(schema.books.id) })
			.from(schema.books);

		return c.json(
			{
				books,
				currentPage: page,
				totalBooks: Number(totalCount),
				totalPage: Math.ceil(Number(totalCount) / limit),
			},
			HttpStatusCode.OK
		);
	} catch (error) {
		console.error('get all books error', error);
		return c.json(
			{ message: 'Internal server error' },
			HttpStatusCode.INTERNAL_SERVER_ERROR
		);
	}
});

const getBookUserRoute = createRoute({
	method: 'get',
	summary: 'Get a book by userId',
	path: '/user',
	tags: ['book'],
	responses: {
		[HttpStatusCode.OK]: jsonContent(
			z.array(selectBookSchema),
			'Books found for the user'
		),
		[HttpStatusCode.NOT_FOUND]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'No books found for this user'
		),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'User Id is required'
		),
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'Internal server error'
		),
	},
});

app.openapi(getBookUserRoute, async c => {
	try {
		const userId = c.get('userId') as number;

		if (!userId) {
			return c.json(
				{ message: 'User Id is required' },
				HttpStatusCode.UNAUTHORIZED
			);
		}

		const books = await db
			.select()
			.from(schema.books)
			.where(eq(schema.books.userId, userId));

		if (books.length === 0) {
			return c.json(
				{ message: 'No books found for this user' },
				HttpStatusCode.NOT_FOUND
			);
		}

		return c.json(books, HttpStatusCode.OK);
	} catch (error) {
		console.error('get book by user error', error);
		return c.json(
			{ message: 'Internal server error' },
			HttpStatusCode.INTERNAL_SERVER_ERROR
		);
	}
});

const deleteBooksRoute = createRoute({
	method: 'delete',
	summary: 'Delete a book',
	path: '/:id',
	tags: ['book'],
	request: {
		params: IdParamsSchema,
	},
	responses: {
		[HttpStatusCode.NO_CONTENT]: {
			description: 'Book deleted successfully',
		},
		[HttpStatusCode.NOT_FOUND]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'book not found'
		),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'You are not authorized to delete this book'
		),
		[HttpStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({
				message: z.string(),
			}),
			'Internal server error'
		),
	},
});

app.openapi(deleteBooksRoute, async c => {
	try {
		const { id } = await c.req.valid('param');

		//check if book exists
		const [book] = await db
			.select()
			.from(schema.books)
			.where(eq(schema.books.id, id))
			.limit(1);

		if (!book) {
			return c.json({ message: 'Book not found' }, HttpStatusCode.NOT_FOUND);
		}

		//check if user is the owner of the book
		const userId = c.get('userId') as number;
		if (userId !== book.userId) {
			return c.json(
				{
					message: 'You are not authorized to delete this book',
				},
				HttpStatusCode.UNAUTHORIZED
			);
		}

		//delete image from cloudinary
		if (book.image && book.image.includes('cloudinary')) {
			try {
				const publicId = book.image.split('/').pop()?.split('.')[0];

				await cloudinary.uploader.destroy(publicId as string);
			} catch (error) {
				console.error('Error deleting image from cloudinary', error);
			}
		}
		//delete book
		await db.delete(schema.books).where(eq(schema.books.id, id));

		return c.body(null, HttpStatusCode.NO_CONTENT);
	} catch (error) {
		console.error('delete book error', error);
		return c.json(
			{ message: 'Internal server error' },
			HttpStatusCode.INTERNAL_SERVER_ERROR
		);
	}
});
