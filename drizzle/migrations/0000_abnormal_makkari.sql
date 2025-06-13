CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"caption" text NOT NULL,
	"title" text NOT NULL,
	"rating" integer DEFAULT 1 NOT NULL,
	"image" text DEFAULT '',
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"release_year" integer
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"profileImage" text DEFAULT '',
	"createAt" timestamp DEFAULT now() NOT NULL,
	"updateAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_username_unique" UNIQUE("username"),
	CONSTRAINT "profile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_userId_profile_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;