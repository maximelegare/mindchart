CREATE TABLE `folder` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`label` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `folder_path_unique` ON `folder` (`path`);