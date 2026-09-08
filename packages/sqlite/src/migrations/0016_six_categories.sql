INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('problem', 'Problem', 'hsl(0, 100%, 89%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('insight', 'Insight', 'hsl(334, 89.8%, 88.4%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('question', 'Question', 'hsl(237.5, 90%, 84.3%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('memory', 'Memory', 'hsl(318.8, 60%, 84.3%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('idea', 'Idea', 'hsl(35.2, 89.7%, 81%)');--> statement-breakpoint
INSERT OR IGNORE INTO `category` (`id`, `name`, `color`) VALUES ('uncategorized', 'Uncategorized', 'hsl(240, 21.5%, 79%)');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('problem', 'en-US', 'Problem');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('insight', 'en-US', 'Insight');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('question', 'en-US', 'Question');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('memory', 'en-US', 'Memory');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('idea', 'en-US', 'Idea');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('uncategorized', 'en-US', 'Uncategorized');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('problem', 'fr-CA', 'Problème');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('insight', 'fr-CA', 'Perspective');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('question', 'fr-CA', 'Question');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('memory', 'fr-CA', 'Souvenir');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('idea', 'fr-CA', 'Idée');--> statement-breakpoint
INSERT OR REPLACE INTO `category_translation` (`id`, `lang`, `label`) VALUES ('uncategorized', 'fr-CA', 'Non classé');--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'problem' WHERE `category_id` = 'problems';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'insight' WHERE `category_id` = 'insights';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'question' WHERE `category_id` = 'questions';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'memory' WHERE `category_id` = 'memories';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'idea' WHERE `category_id` = 'ideas';--> statement-breakpoint
UPDATE `thought` SET `category_id` = 'uncategorized' WHERE `category_id` NOT IN ('problem', 'insight', 'question', 'memory', 'idea', 'uncategorized');--> statement-breakpoint
DELETE FROM `category_translation` WHERE `id` NOT IN ('problem', 'insight', 'question', 'memory', 'idea', 'uncategorized');--> statement-breakpoint
DELETE FROM `category` WHERE `id` NOT IN ('problem', 'insight', 'question', 'memory', 'idea', 'uncategorized');
