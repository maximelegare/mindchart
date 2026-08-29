CREATE TABLE `category_translation` (
	`id` text NOT NULL,
	`lang` text NOT NULL,
	`label` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`edited_at` text,
	PRIMARY KEY(`id`, `lang`),
	FOREIGN KEY (`id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE cascade
);
