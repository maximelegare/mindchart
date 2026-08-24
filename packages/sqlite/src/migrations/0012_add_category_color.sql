ALTER TABLE `category` ADD `color` text NOT NULL DEFAULT 'hsl(0, 0%, 84.3%)';
--> statement-breakpoint
UPDATE `category` SET `color` = CASE `id`
	WHEN 'ideas' THEN 'hsl(35.2, 89.7%, 81%)'
	WHEN 'tasks' THEN 'hsl(53.8, 82.9%, 79.4%)'
	WHEN 'events' THEN 'hsl(205.7, 55.3%, 85.1%)'
	WHEN 'places' THEN 'hsl(23.8, 59.2%, 80.8%)'
	WHEN 'goals' THEN 'hsl(293.9, 95.2%, 83.7%)'
	WHEN 'problems' THEN 'hsl(0, 100%, 89%)'
	WHEN 'insights' THEN 'hsl(334, 89.8%, 88.4%)'
	WHEN 'plans' THEN 'hsl(109.6, 21.5%, 79%)'
	WHEN 'questions' THEN 'hsl(237.5, 90%, 84.3%)'
	WHEN 'memories' THEN 'hsl(318.8, 60%, 84.3%)'
	WHEN 'learning' THEN 'hsl(259.5, 71.4%, 89%)'
	WHEN 'preferences' THEN 'hsl(177.5, 67.9%, 79.2%)'
	WHEN 'projects' THEN 'hsl(113.8, 45.9%, 71%)'
	WHEN 'random' THEN 'hsl(310.9, 19.6%, 78%)'
	WHEN 'uncategorized' THEN 'hsl(240, 21.5%, 79%)'
	WHEN 'other' THEN 'hsl(0, 0%, 84.3%)'
	ELSE 'hsl(0, 0%, 84.3%)'
END;
