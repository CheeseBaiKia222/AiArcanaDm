CREATE TABLE `reposts` (
	`profile_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`profile_id`, `post_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_reposts_post` ON `reposts` (`post_id`);
--> statement-breakpoint
CREATE TRIGGER revision_reposts_insert AFTER INSERT ON reposts BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;

--> statement-breakpoint
CREATE TRIGGER revision_reposts_update AFTER UPDATE ON reposts BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;

--> statement-breakpoint
CREATE TRIGGER revision_reposts_delete AFTER DELETE ON reposts BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
