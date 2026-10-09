ALTER TABLE `thought` ADD `nlp_structure_locked` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `thought` ADD `nlp_structure_source_hash` text;--> statement-breakpoint
ALTER TABLE `thought` ADD `nlp_structure_anchor` blob;
