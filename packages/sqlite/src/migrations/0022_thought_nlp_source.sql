ALTER TABLE `thought` ADD `nlp_source_hash` text;--> statement-breakpoint
ALTER TABLE `thought` ADD `title_source` text DEFAULT 'generated' NOT NULL;--> statement-breakpoint
ALTER TABLE `thought` ADD `category_source` text DEFAULT 'generated' NOT NULL;--> statement-breakpoint
UPDATE `thought`
SET `title_source` = 'user'
WHERE `title` IS NOT NULL AND trim(`title`) != '';--> statement-breakpoint
UPDATE `thought`
SET `category_source` = 'user'
WHERE `category_id` IS NOT NULL AND `category_id` != 'uncategorized';
