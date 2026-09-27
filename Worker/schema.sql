CREATE TABLE IF NOT EXISTS game_saves (
 player TEXT NOT NULL,
 campaign TEXT NOT NULL,
 state TEXT NOT NULL,
 updated_at INTEGER NOT NULL,
 PRIMARY KEY (player, campaign)
);
