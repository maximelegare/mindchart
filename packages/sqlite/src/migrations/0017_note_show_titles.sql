ALTER TABLE `note` ADD `show_titles` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `note` SET `show_titles` = 1
WHERE EXISTS (
  SELECT 1 FROM `thought`
  WHERE `thought`.`note_id` = `note`.`id`
    AND `thought`.`title` IS NOT NULL
    AND trim(`thought`.`title`) != ''
);
