ALTER TABLE network_stats
DROP COLUMN datatime;

/* update functions to use created_at field */

CREATE OR REPLACE FUNCTION pool_stats_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('pool_stats_upd', json_build_array(
    new.pool_id,
    json_build_array(
      extract(epoch from DATE_TRUNC('min', new.created_at)),
      new.hashrate,
      (
        SELECT type 
        FROM pool_state
        WHERE pool_state.id = new.pool_state_id
      ),
      new.orphan_blocks,
      new.wait_sync_blocks,
      new.hosts
    )
  )::text);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION network_stats_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('net_stats_upd', json_build_array(
    extract(epoch from DATE_TRUNC('min', new.created_at)), 
    new.hashrate, 
    new.supply, 
    new.blocks, 
    new.main_blocks, 
    new.hosts, 
    new.chain_difficulty 
  )::text);
  RETURN new;
END;
$$ LANGUAGE plpgsql;