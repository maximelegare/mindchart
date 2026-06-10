PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_note` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`summary` text,
	`raw_text` text,
	`topic_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_note`("id", "title", "summary", "raw_text", "topic_id", "created_at") SELECT "id", "title", "summary", "raw_text", "topic_id", "created_at" FROM `note`;--> statement-breakpoint
DROP TABLE `note`;--> statement-breakpoint
ALTER TABLE `__new_note` RENAME TO `note`;--> statement-breakpoint
PRAGMA foreign_keys=ON;