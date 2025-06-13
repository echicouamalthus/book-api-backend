CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`caption` text NOT NULL,
	`title` text NOT NULL,
	`rating` integer DEFAULT 1 NOT NULL,
	`image` text DEFAULT '',
	`userId` integer NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`release_year` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`profileImage` text DEFAULT '',
	`createAt` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updateAt` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);