CREATE TABLE `feeling` (
	`value` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `note` ADD `feeling` integer REFERENCES feeling(value);
--> statement-breakpoint
INSERT INTO `feeling` (`value`, `label`) VALUES
	(2, 'Great'),
	(1, 'Good'),
	(0, 'Neutral'),
	(-1, 'Bad'),
	(-2, 'Awful');
--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'other' WHERE `category_id` = 'feelings';
--> statement-breakpoint
DELETE FROM `category` WHERE `id` = 'feelings';
