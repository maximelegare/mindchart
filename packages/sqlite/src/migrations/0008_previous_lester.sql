CREATE TABLE `person` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_id` text,
	`phone` text,
	`email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `person_contact_id_unique` ON `person` (`contact_id`);--> statement-breakpoint
CREATE TABLE `person_to_note` (
	`person_id` text NOT NULL,
	`note_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`person_id`, `note_id`),
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'other' WHERE `category_id` = 'people';
--> statement-breakpoint
DELETE FROM `category` WHERE `id` = 'people';
