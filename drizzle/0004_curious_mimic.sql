CREATE TABLE `study_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`folder_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text DEFAULT 'mint' NOT NULL,
	`cover_key` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_accessed_at` text
);
--> statement-breakpoint
DROP INDEX `material_owner_course_source_options`;--> statement-breakpoint
ALTER TABLE `learning_materials` ADD `set_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `material_owner_set_source_options` ON `learning_materials` (`owner_id`,`set_id`,`source_hash`,`options_key`) WHERE "learning_materials"."set_id" is not null;