const yaml = require('js-yaml');
const fs = require('fs');
const validate = require('uuid-validate');

describe('Pool list', () => {
  const poolList = yaml.safeLoad(fs.readFileSync('./pool-list.yml', 'utf8'));
  const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

  test('Should be a valid yaml file and return an array', () => {
    expect(poolList).toEqual(expect.any(Array));
  });

  test('Each pool should have a unique UUID V4 id', () => {
    const idList = poolList.map(({ id }) => {
      expect(id).toBeDefined();

      const validId = validate(id, 4);
      expect(validId).toEqual(true);

      return id;
    });

    const uniqueIdList = Array.from(new Set(idList));
    expect(idList).toEqual(uniqueIdList);
  });

  test('Each pool should have a name', () => {
    poolList.forEach(({ name }) => {
      expect(name).toEqual(expect.any(String));
    });
  });

  test('Each pool should have one or more mining addresses', () => {
    poolList.forEach(({ miningAddress }) => {
      expect(
        Array.isArray(miningAddress) || typeof miningAddress === 'string'
      ).toBeTruthy();
    });
  });

  test('Each pool should have a valid state and stats url', () => {
    poolList.forEach(({ stateUrl, statsUrl }) => {
      expect(stateUrl).toBeDefined();
      expect(stateUrl).toEqual(expect.stringMatching(urlRegex));
      expect(statsUrl).toBeDefined();
      expect(statsUrl).toEqual(expect.stringMatching(urlRegex));
    });
  });

  test('Each pool should have valid payment values', () => {
    poolList.forEach(
      ({
        paymentPool,
        paymentFinder,
        paymentContributor,
        paymentCommunity
      }) => {
        expect(paymentPool).toBeGreaterThanOrEqual(0);
        expect(paymentPool).toBeLessThanOrEqual(100);
        expect(paymentFinder).toBeGreaterThanOrEqual(0);
        expect(paymentFinder).toBeLessThanOrEqual(100);
        expect(paymentContributor).toBeGreaterThanOrEqual(0);
        expect(paymentContributor).toBeLessThanOrEqual(100);
        expect(paymentCommunity).toBeGreaterThanOrEqual(0);
        expect(paymentCommunity).toBeLessThanOrEqual(100);
      }
    );
  });

  test('Optional website value should be a valid url', () => {
    poolList.forEach(pool => {
      if (pool.hasOwnProperty('website')) {
        expect(pool.website).toEqual(expect.stringMatching(urlRegex));
      }
    });
  });

  test('Optional location value should be a string', () => {
    poolList.forEach(pool => {
      if (pool.hasOwnProperty('location')) {
        expect(pool.location).toEqual(expect.any(String));
      }
    });
  });

  test('Optional locationCoordinate value should be a valid longitude and latitude point (x, y)', () => {
    poolList.forEach(pool => {
      if (pool.hasOwnProperty('locationCoordinate')) {
        expect(pool.locationCoordinate).toEqual(
          expect.stringMatching(/^\(-?\d+\.{0,1}\d*,\s?-?\d+\.{0,1}\d*\)$/gi)
        );
      }
    });
  });
});
