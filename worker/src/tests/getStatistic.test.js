const mockServer = require('./server');
const getResponse = require('../utils/getResponse');
const {
  getState,
  getStatisticGenerator,
  getPoolStatistics
} = require('../utils/getStatistic');

let server;
const port = 8181;
const endpoint = `http://localhost:${port}`;

beforeAll(done => {
  server = mockServer.listen({ port }, done);
});

afterAll(done => {
  server.close(done);
});

describe('getStatisticGenerator', () => {
  test('Should generate a function that returns a statistic from a response', async () => {
    const getStatistic = getStatisticGenerator({
      jsonKey: 'hosts',
      textKey: 'hosts',
      primitive: Number,
      validate: value => !Number.isNaN(value)
    });

    const response1 = await getResponse(`${endpoint}/json-state`);
    const hosts1 = await getStatistic(response1, 0);
    const response2 = await getResponse(`${endpoint}/stats`);
    const hosts2 = await getStatistic(response2, 1);

    expect(hosts1).toBe(595);
    expect(hosts2).toBe(594);
  });

  test('Generated function should return undefined when the specified validator returns false', async () => {
    const getStatistic = getStatisticGenerator({
      jsonKey: 'chain_difficulty',
      textKey: 'chain difficulty',
      primitive: Number,
      validate: value => !Number.isNaN(value)
    });

    const response = await getResponse(`${endpoint}/stats`);
    const chainDiff = await getStatistic(response, 0);

    expect(chainDiff).toBeUndefined();
  });
});

describe('getPoolStatistics', () => {
  test('Should return pool stats from a json response', async () => {
    const response = await getResponse(`${endpoint}/json-state`);
    const { hashrate, hosts, waitSyncBlocks, orphanBlocks } = getPoolStatistics(
      response
    );

    expect(hashrate).toBe(2009.28);
    expect(hosts).toBe(595);
    expect(waitSyncBlocks).toBe(72809);
    expect(orphanBlocks).toBe(6);
  });

  test('Should return pool stats from a text response', async () => {
    const response = await getResponse(`${endpoint}/stats`);
    const { hashrate, hosts, waitSyncBlocks, orphanBlocks } = getPoolStatistics(
      response
    );

    expect(hashrate).toBe(1524.48);
    expect(hosts).toBe(593);
    expect(waitSyncBlocks).toBe(50766);
    expect(orphanBlocks).toBe(11);
  });
});

describe('getState', () => {
  test('Should find the network state from an object returned by getResponse()', async () => {
    const response1 = await getResponse(`${endpoint}/state`);
    const state1 = await getState(response1);
    const response2 = await getResponse(`${endpoint}/state-connect`);
    const state2 = await getState(response2);

    expect(state1).toHaveProperty('id');
    expect(state1).toEqual(
      expect.objectContaining({
        type: 'ON',
        server_response: 'Synchronized with the main network. Normal operation.'
      })
    );

    expect(state2).toHaveProperty('id');
    expect(state2).toEqual(
      expect.objectContaining({
        type: 'MAINTENANCE',
        server_response: 'Trying to connect to the main network.'
      })
    );
  });

  test(`Should return state "NO_RESPONSE" if getResponse() returned with { ..., success: false }`, async () => {
    const response = await getResponse(`${endpoint}/404`);
    const state = await getState(response);

    expect(state).toEqual(
      expect.objectContaining({
        type: 'NO_RESPONSE',
        server_response: null
      })
    );
  });

  test(`Should return state "UNKNOWN" if getResponse() doesn't contain a valid state`, async () => {
    const response = await getResponse(`${endpoint}/state-bad`);
    const state = await getState(response);

    expect(state).toEqual(
      expect.objectContaining({
        type: 'UNKNOWN',
        server_response: null
      })
    );
  });
});
