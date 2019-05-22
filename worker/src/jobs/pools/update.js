const yaml = require('js-yaml');
const fetch = require('node-fetch');

const db = require('../../db');
const {
  logger,
  getPoolResponse,
  findSoftwareVersion,
  validatePayment
} = require('../../utils');

const dataUrl =
  'https://raw.githubusercontent.com/XDagger/XDagger.github.io/develop/_data/pool.yml';

const update = async () => {
  const [databasePools, response] = await Promise.all([
    db.query('SELECT id from pool'),
    fetch(dataUrl)
  ]);
  const body = await response.text();

  const loadedPools = yaml.safeLoad(body);

  await Promise.all(
    loadedPools.map(
      async ({
        id,
        name,
        website,
        miningAddress,
        stateUrl,
        statsUrl,
        paymentPool,
        paymentFinder,
        paymentContributor,
        paymentCommunity,
        location,
        locationCoordinate
      }) => {
        let version;
        let paymentPoolWeb;
        let paymentFinderWeb;
        let paymentContributorWeb;
        let paymentCommunityWeb;

        const statement = `
            INSERT INTO pool (
                id,
                name,
                website,
                mining_address,
                state_url,
                stats_url,
                payment_pool,
                payment_finder,
                payment_contributor,
                payment_community,
                location,
                location_coordinate,
                version
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13
            )
            ON CONFLICT (id) DO UPDATE
                SET name = excluded.name,
                    website = excluded.website,
                    mining_address = excluded.mining_address,
                    state_url = excluded.state_url,
                    stats_url = excluded.stats_url,
                    payment_pool = excluded.payment_pool,
                    payment_finder = excluded.payment_finder,
                    payment_contributor = excluded.payment_contributor,
                    payment_community = excluded.payment_community,
                    location = excluded.location,
                    location_coordinate = excluded.location_coordinate,
                    version = excluded.version;
        `;

        // Get pool XDAG software version number
        // get payment config if state url is served through openXDAGpool
        const { body, success } = await getPoolResponse(stateUrl);

        if (stateUrl === statsUrl && success) {
          version = body.version || null;
          paymentPoolWeb = validatePayment(body.pool_config.fee);
          paymentFinderWeb = validatePayment(body.pool_config.reward);
          paymentContributorWeb = validatePayment(body.pool_config.direct);
          paymentCommunityWeb = validatePayment(body.pool_config.fund);
        } else if (success) {
          version = findSoftwareVersion(body);
        }

        db.query(statement, [
          id,
          name,
          website,
          `{${miningAddress}}`, // TEXT arrays in postgres require brackets around the value
          stateUrl,
          statsUrl,
          paymentPoolWeb || paymentPool,
          paymentFinderWeb || paymentFinder,
          paymentContributorWeb || paymentContributor,
          paymentCommunityWeb || paymentCommunity,
          location,
          locationCoordinate,
          version
        ]);

        return id;
      }
    )
  );

  // Delete the same pools from our database that were deleted in the YAML file
  await Promise.all(
    databasePools.map(async databasePool => {
      if (!loadedPools.find(loadedPool => loadedPool.id === databasePool.id)) {
        return db.query('DELETE FROM pool WHERE id = $1', [databasePool.id]);
      }
      return true;
    })
  );

  db.cache.del('pool_list');
  logger.info(`Updated database entries for pools`);
};

module.exports = {
  update
};
