INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('idea', 'Idea', 'hsl(28, 92%, 76%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('problem', 'Problem', 'hsl(4, 88%, 78%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('question', 'Question', 'hsl(217, 82%, 78%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('action', 'Action', 'hsl(328, 78%, 84%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('fact', 'Fact', 'hsl(142, 48%, 74%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('observation', 'Observation', 'hsl(268, 58%, 82%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('hypothesis', 'Hypothesis', 'hsl(199, 62%, 84%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('item', 'Item', 'hsl(48, 88%, 76%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('uncategorized', 'Uncategorized', 'hsl(220, 8%, 80%)');--> statement-breakpoint
UPDATE `category` SET `name` = 'Idea', `color` = 'hsl(28, 92%, 76%)' WHERE `id` = 'idea';--> statement-breakpoint
UPDATE `category` SET `name` = 'Problem', `color` = 'hsl(4, 88%, 78%)' WHERE `id` = 'problem';--> statement-breakpoint
UPDATE `category` SET `name` = 'Question', `color` = 'hsl(217, 82%, 78%)' WHERE `id` = 'question';--> statement-breakpoint
UPDATE `category` SET `name` = 'Action', `color` = 'hsl(328, 78%, 84%)' WHERE `id` = 'action';--> statement-breakpoint
UPDATE `category` SET `name` = 'Fact', `color` = 'hsl(142, 48%, 74%)' WHERE `id` = 'fact';--> statement-breakpoint
UPDATE `category` SET `name` = 'Observation', `color` = 'hsl(268, 58%, 82%)' WHERE `id` = 'observation';--> statement-breakpoint
UPDATE `category` SET `name` = 'Hypothesis', `color` = 'hsl(199, 62%, 84%)' WHERE `id` = 'hypothesis';--> statement-breakpoint
UPDATE `category` SET `name` = 'Item', `color` = 'hsl(48, 88%, 76%)' WHERE `id` = 'item';--> statement-breakpoint
UPDATE `category` SET `name` = 'Uncategorized', `color` = 'hsl(220, 8%, 80%)' WHERE `id` = 'uncategorized';--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('idea', 'en-US', 'Idea');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('problem', 'en-US', 'Problem');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('question', 'en-US', 'Question');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('action', 'en-US', 'Action');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('fact', 'en-US', 'Fact');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('observation', 'en-US', 'Observation');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('hypothesis', 'en-US', 'Hypothesis');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('item', 'en-US', 'Item');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('uncategorized', 'en-US', 'Uncategorized');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('idea', 'fr-CA', 'Idée');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('problem', 'fr-CA', 'Problème');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('question', 'fr-CA', 'Question');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('action', 'fr-CA', 'Action');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('fact', 'fr-CA', 'Fait');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('observation', 'fr-CA', 'Observation');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('hypothesis', 'fr-CA', 'Hypothèse');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('item', 'fr-CA', 'Élément');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('uncategorized', 'fr-CA', 'Non classé');--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'observation' WHERE `category_id` = 'insight';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'fact' WHERE `category_id` = 'memory';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'uncategorized' WHERE `category_id` NOT IN ('idea', 'problem', 'question', 'action', 'fact', 'observation', 'hypothesis', 'item', 'uncategorized');--> statement-breakpoint
DELETE FROM `category_translation` WHERE `id` NOT IN ('idea', 'problem', 'question', 'action', 'fact', 'observation', 'hypothesis', 'item', 'uncategorized');--> statement-breakpoint
DELETE FROM `category` WHERE `id` NOT IN ('idea', 'problem', 'question', 'action', 'fact', 'observation', 'hypothesis', 'item', 'uncategorized');
