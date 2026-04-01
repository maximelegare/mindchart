CREATE TABLE `app_data` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`migrate` integer,
	`data` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `embedding` (
	`id` text PRIMARY KEY NOT NULL,
	`embedding` blob,
	`thought_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`thought_id`) REFERENCES `thought`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `note` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`summary` text,
	`topic_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `thought` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`title` text,
	`summary` text,
	`semantic_label` text,
	`category_id` text DEFAULT 'uncategorized' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `topic` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`embedding` blob,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
