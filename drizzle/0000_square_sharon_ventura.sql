CREATE TABLE `learning_materials` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`course` text NOT NULL,
	`kind` text NOT NULL,
	`size` integer NOT NULL,
	`source_hash` text NOT NULL,
	`options_key` text NOT NULL,
	`original_key` text NOT NULL,
	`processed_key` text NOT NULL,
	`page_count` integer NOT NULL,
	`chunk_count` integer NOT NULL,
	`approved_concept_ids` text DEFAULT '[]' NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `material_owner_course_source_options` ON `learning_materials` (`owner_id`,`course`,`source_hash`,`options_key`);