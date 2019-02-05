/************************************************************************************************************
** Create tables
*************************************************************************************************************/

-- Main

CREATE TABLE pool (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  mining_address TEXT[] NOT NULL,
  state_url TEXT NOT NULL,
  stats_url TEXT NOT NULL,
  payment_pool NUMERIC(5, 2) NOT NULL CHECK (payment_pool <= 100 AND payment_pool >= 0),
  payment_finder NUMERIC(5, 2) NOT NULL CHECK (payment_finder <= 100 AND payment_finder >= 0),
  payment_contributor NUMERIC(5, 2) NOT NULL CHECK (payment_contributor <= 100 AND payment_contributor >= 0),
  payment_community NUMERIC(5, 2) NOT NULL CHECK (payment_community <= 100 AND payment_community >= 0),
  location TEXT,
  location_coordinate POINT,
  version TEXT
);

CREATE TABLE pool_state (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  server_response TEXT
);

CREATE TABLE pool_stats (
  id SERIAL PRIMARY KEY,
  datatime TIMESTAMP NOT NULL,
  pool_id CHAR(36) NOT NULL REFERENCES pool ON DELETE CASCADE ON UPDATE CASCADE,
  pool_state_id INTEGER REFERENCES pool_state,
  hashrate NUMERIC(16, 2),
  orphan_blocks BIGINT,
  wait_sync_blocks BIGINT,
  hosts INTEGER
);

CREATE TABLE network_stats (
  id SERIAL PRIMARY KEY,
  datatime TIMESTAMP NOT NULL,
  hashrate NUMERIC(16, 2),
  supply BIGINT,
  main_blocks BIGINT,
  blocks BIGINT,
  hosts INTEGER,
  chain_difficulty NUMERIC(64)
);


/************************************************************************************************************
** Notify / Listen channels
*************************************************************************************************************/

CREATE FUNCTION pool_stats_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('pool_stats_upd', json_build_array(
    new.pool_id,
    json_build_array(
      extract(epoch from DATE_TRUNC('min', new.datatime)),
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

CREATE FUNCTION network_stats_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('net_stats_upd', json_build_array(
    extract(epoch from DATE_TRUNC('min', new.datatime)), 
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

CREATE TRIGGER pool_stats_trigger AFTER INSERT ON pool_stats
FOR EACH ROW EXECUTE PROCEDURE pool_stats_notify();

CREATE TRIGGER network_stats_trigger AFTER INSERT ON network_stats
FOR EACH ROW EXECUTE PROCEDURE network_stats_notify();


/************************************************************************************************************
** Insert data
*************************************************************************************************************/

-- Pool states

INSERT INTO pool_state(type, server_response) VALUES
('ON', 'Synchronized with the main network. Normal operation.'),
('ON', 'Waiting for transfer to complete.'),
('SYNC', 'Connected to the main network. Synchronizing.'),
('MAINTENANCE', 'Loading blocks from the local storage.'),
('MAINTENANCE', 'Trying to connect to the main network.'),
('OFFLINE', 'Can''t connect to unix domain socket errno:111'),
('NO_RESPONSE', NULL),
('UNKNOWN', NULL);