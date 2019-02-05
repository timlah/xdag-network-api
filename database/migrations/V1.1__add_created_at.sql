ALTER TABLE pool_stats
ADD COLUMN created_at timestamp default current_timestamp;

ALTER TABLE network_stats
ADD COLUMN created_at timestamp default current_timestamp;

/* Use datatime field for existing entries */
UPDATE pool_stats
SET created_at = datatime;

UPDATE network_stats
SET created_at = datatime;