CREATE TABLE `course_folders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`course` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_folder_owner_location` ON `course_folders` (`owner_id`,`year`,`semester`,`course`);