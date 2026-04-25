PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_embedding` (
	`id` text PRIMARY KEY NOT NULL,
	`embedding` blob,
	`thought_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`thought_id`) REFERENCES `thought`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_embedding`("id", "embedding", "thought_id", "status", "created_at") SELECT "id", "embedding", "thought_id", "status", "created_at" FROM `embedding`;--> statement-breakpoint
DROP TABLE `embedding`;--> statement-breakpoint
ALTER TABLE `__new_embedding` RENAME TO `embedding`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_thought` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`title` text,
	`summary` text,
	`semantic_label` text,
	`category_id` text DEFAULT 'uncategorized' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_thought`("id", "note_id", "title", "summary", "semantic_label", "category_id", "created_at") SELECT "id", "note_id", "title", "summary", "semantic_label", "category_id", "created_at" FROM `thought`;--> statement-breakpoint
DROP TABLE `thought`;--> statement-breakpoint
ALTER TABLE `__new_thought` RENAME TO `thought`;