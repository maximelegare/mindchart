CREATE TABLE `content` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL
);--> statement-breakpoint
CREATE TABLE `text_content` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE TABLE `list_item_content` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE TABLE `checkbox_content` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `content` (`id`, `type`)
SELECT `id` || '_c', CASE WHEN `is_completable` = 1 THEN 'checkbox' ELSE 'li' END
FROM `thought`;--> statement-breakpoint
INSERT INTO `list_item_content` (`id`, `text`)
SELECT `id` || '_c', COALESCE(`summary`, '')
FROM `thought`
WHERE COALESCE(`is_completable`, 0) = 0;--> statement-breakpoint
INSERT INTO `checkbox_content` (`id`, `text`, `checked`)
SELECT `id` || '_c', COALESCE(`summary`, ''), COALESCE(`is_completed`, 0)
FROM `thought`
WHERE `is_completable` = 1;--> statement-breakpoint
CREATE TABLE `__new_thought` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`type` text NOT NULL,
	`content_id` text NOT NULL,
	`title` text,
	`semantic_label` text,
	`category_id` text DEFAULT 'uncategorized' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
INSERT INTO `__new_thought` (`id`, `note_id`, `type`, `content_id`, `title`, `semantic_label`, `category_id`, `created_at`)
SELECT
	`id`,
	`note_id`,
	CASE WHEN `is_completable` = 1 THEN 'checkbox' ELSE 'li' END,
	`id` || '_c',
	`title`,
	`semantic_label`,
	`category_id`,
	`created_at`
FROM `thought`;--> statement-breakpoint
DROP TABLE `thought`;--> statement-breakpoint
ALTER TABLE `__new_thought` RENAME TO `thought`;--> statement-breakpoint
DROP TABLE IF EXISTS `thought_fts`;--> statement-breakpoint
CREATE VIRTUAL TABLE `thought_fts` USING fts5(
	id UNINDEXED,
	title,
	body,
	semantic_label
);--> statement-breakpoint
INSERT INTO `thought_fts` (`id`, `title`, `body`, `semantic_label`)
SELECT
	t.`id`,
	COALESCE(t.`title`, ''),
	COALESCE(li.`text`, cb.`text`, tx.`text`, ''),
	COALESCE(t.`semantic_label`, '')
FROM `thought` t
LEFT JOIN `list_item_content` li ON li.`id` = t.`content_id`
LEFT JOIN `checkbox_content` cb ON cb.`id` = t.`content_id`
LEFT JOIN `text_content` tx ON tx.`id` = t.`content_id`;
