PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_note` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`summary` text,
	`raw_text` text,
	`folder_id` text,
	`feeling` integer,
	`location_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`feeling`) REFERENCES `feeling`(`value`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_note`("id", "title", "summary", "raw_text", "folder_id", "feeling", "location_id", "created_at") SELECT "id", "title", "summary", "raw_text", "folder_id", "feeling", "location_id", "created_at" FROM `note`;--> statement-breakpoint
DROP TABLE `note`;--> statement-breakpoint
ALTER TABLE `__new_note` RENAME TO `note`;--> statement-breakpoint
DROP TABLE `topic`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
