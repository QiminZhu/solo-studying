DROP INDEX `material_owner_course_source_options`;--> statement-breakpoint
ALTER TABLE `learning_materials` ADD `year` integer;--> statement-breakpoint
ALTER TABLE `learning_materials` ADD `semester` integer;--> statement-breakpoint
ALTER TABLE `learning_materials` ADD `category` text DEFAULT 'Lectures' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `material_owner_course_source_options` ON `learning_materials` (`owner_id`,`course`,`year`,`semester`,`category`,`source_hash`,`options_key`);