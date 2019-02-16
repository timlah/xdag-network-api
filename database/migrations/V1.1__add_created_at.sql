ALTER TABLE pool_stats
ADD COLUMN created_at TIMESTAMP default current_timestamp;

ALTER TABLE network_stats
ADD COLUMN created_at TIMESTAMP default current_timestamp;

/* Use datatime field for existing entries */
UPDATE pool_stats
SET created_at = datatime;

UPDATE network_stats
SET created_at = datatime;

/* Finally add not null constraint */

ALTER TABLE pool_stats
ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE network_stats
ALTER COLUMN created_at SET NOT NULL;