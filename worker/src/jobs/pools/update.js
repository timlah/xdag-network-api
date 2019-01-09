const yaml = require('js-yaml');

const db = require('../../db');
const {
  logger,
  getResponse,
  findSoftwareVersion,
  validatePayment
} = require('../../utils');

const dataUrl =
  'https://raw.githubusercontent.com/timlah/xdag-network-api/master/pools.yml';

const update = async () => {
  const response = await getResponse(dataUrl);

  const pools = yaml.safeLoad(response.body);

  await Promise.all(
    pools.map(
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
        const { body, success } = await getResponse(stateUrl);

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
      }
    )
  );

  db.cache.del('pool_list');
  logger.info(`Updated database entries for pools`);
};

module.exports = {
  update
};
