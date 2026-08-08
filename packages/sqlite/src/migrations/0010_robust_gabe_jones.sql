CREATE TABLE `location` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `location_name_unique` ON `location` (`name`);--> statement-breakpoint
ALTER TABLE `note` ADD `location_id` text REFERENCES location(id);