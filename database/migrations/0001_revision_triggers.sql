CREATE TRIGGER revision_users_insert AFTER INSERT ON users BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_users_update AFTER UPDATE ON users BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_users_delete AFTER DELETE ON users BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_sessions_insert AFTER INSERT ON sessions BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_sessions_update AFTER UPDATE ON sessions BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_sessions_delete AFTER DELETE ON sessions BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_profiles_insert AFTER INSERT ON profiles BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_profiles_update AFTER UPDATE ON profiles BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_profiles_delete AFTER DELETE ON profiles BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_interests_insert AFTER INSERT ON interests BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_interests_update AFTER UPDATE ON interests BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_interests_delete AFTER DELETE ON interests BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_profile_interests_insert AFTER INSERT ON profile_interests BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_profile_interests_update AFTER UPDATE ON profile_interests BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_profile_interests_delete AFTER DELETE ON profile_interests BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_posts_insert AFTER INSERT ON posts BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_posts_update AFTER UPDATE ON posts BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_posts_delete AFTER DELETE ON posts BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_boards_insert AFTER INSERT ON boards BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_boards_update AFTER UPDATE ON boards BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_boards_delete AFTER DELETE ON boards BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_board_items_insert AFTER INSERT ON board_items BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_board_items_update AFTER UPDATE ON board_items BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_board_items_delete AFTER DELETE ON board_items BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_follows_insert AFTER INSERT ON follows BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_follows_update AFTER UPDATE ON follows BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_follows_delete AFTER DELETE ON follows BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_likes_insert AFTER INSERT ON likes BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_likes_update AFTER UPDATE ON likes BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_likes_delete AFTER DELETE ON likes BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_comments_insert AFTER INSERT ON comments BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_comments_update AFTER UPDATE ON comments BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_comments_delete AFTER DELETE ON comments BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_conversations_insert AFTER INSERT ON conversations BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_conversations_update AFTER UPDATE ON conversations BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_conversations_delete AFTER DELETE ON conversations BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_messages_insert AFTER INSERT ON messages BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_messages_update AFTER UPDATE ON messages BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_messages_delete AFTER DELETE ON messages BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_conversation_reads_insert AFTER INSERT ON conversation_reads BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_conversation_reads_update AFTER UPDATE ON conversation_reads BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_conversation_reads_delete AFTER DELETE ON conversation_reads BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_notifications_insert AFTER INSERT ON notifications BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_notifications_update AFTER UPDATE ON notifications BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_notifications_delete AFTER DELETE ON notifications BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_invitations_insert AFTER INSERT ON invitations BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_invitations_update AFTER UPDATE ON invitations BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_invitations_delete AFTER DELETE ON invitations BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_matches_insert AFTER INSERT ON matches BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_matches_update AFTER UPDATE ON matches BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_matches_delete AFTER DELETE ON matches BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_moves_insert AFTER INSERT ON moves BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_moves_update AFTER UPDATE ON moves BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_moves_delete AFTER DELETE ON moves BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_blocks_insert AFTER INSERT ON blocks BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_blocks_update AFTER UPDATE ON blocks BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_blocks_delete AFTER DELETE ON blocks BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_reports_insert AFTER INSERT ON reports BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_reports_update AFTER UPDATE ON reports BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;
--> statement-breakpoint
CREATE TRIGGER revision_reports_delete AFTER DELETE ON reports BEGIN INSERT INTO app_revision(id,revision) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET revision=revision+1; END;