ALTER TABLE `thought` ADD `position` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `thought`
SET `position` = (
  SELECT COUNT(*) FROM `thought` AS `other`
  WHERE `other`.`note_id` = `thought`.`note_id`
    AND `other`.`rowid` < `thought`.`rowid`
);
