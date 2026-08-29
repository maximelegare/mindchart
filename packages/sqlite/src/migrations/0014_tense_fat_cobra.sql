ALTER TABLE `note` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `note` ADD `last_viewed_at` text;