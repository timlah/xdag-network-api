const fetch = require('jest-fetch-mock');

const {
  getState,
  getStatisticGenerator,
  getPoolStatistics,
  getResponse
} = require('../utils');

const validStatesPromise = Promise.resolve([
  {
    type: 'ON',
    server_response: 'Synchronized with the main network. Normal operation.'
  },
  {
    type: 'ON',
    server_response: 'Waiting for transfer to complete.'
  },
  {
    type: 'SYNC',
    server_response: 'Connected to the main network. Synchronizing.'
  },
  {
    type: 'MAINTENANCE',
    server_response: 'Loading blocks from the local storage.'
  },
  {
    type: 'MAINTENANCE',
    server_response: 'Trying to connect to the main network.'
  },
  {
    type: 'OFFLINE',
    server_response: "Can''t connect to unix domain socket errno:111"
  },
  {
    type: 'NO_RESPONSE',
    server_response: null
  },
  {
    type: 'UNKNOWN',
    server_response: null
  }
]);

const stateResponse = {
  connect: 'XDAG 0.2.5 Trying to connect to the main network.',
  on: 'XDAG 0.2.5 Synchronized with the main network. Normal operation.',
  invalid: 'foobar',
  json: {
    version: '0.2.5',
    state: 'Synchronized with the main network. Normal operation.',
    stats: {
      hosts: [595, 596],
      blocks: [113266024, 113266024],
      main_blocks: [392080, 392080],
      orphan_blocks: 6,
      wait_sync_blocks: 72809,
      chain_difficulty: [
        '81920b3379caa2ea50f7436448d',
        '81920b3379caa2ea50f7436448d'
      ],
      xdag_supply: [401489920, 401489920],
      '4_hr_hashrate_mhs': [2009.28, 48535414.88],
      hashrate: [2106882785.28, 50893071193211]
    },
    pool_config: {
      max_conn: 8192,
      max_ip: 2048,
      max_addr: 2048,
      fee: 0,
      reward: 20,
      direct: 10,
      fund: 1
    },
    date: 'Tue Oct 23 18:49:02 UTC 2018'
  }
};

const statsResponse = `Statistics for ours and maximum known parameters:
hosts: 593 of 594
blocks: 110489092 of 110489092
main blocks: 380782 of 380782
orphan blocks: 11
wait sync blocks: 50766
chain difficulty: 8062ba6b4d81288231492060020 of 8062ba6b4d81288231492060020
XDAG supply: 389920768.000000000 of 389920768.000000000
hour hashrate MHs: 1524.48 of 61804085.91`;

// mock db module return promise for getState()
jest.mock('../db', () => ({
  // eslint-disable-next-line no-unused-vars
  query: jest.fn(query => validStatesPromise)
}));

describe('getStatisticGenerator', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('Should generate a function that returns the specified statistic from a response', async () => {
    fetch.once(JSON.stringify(stateResponse.json)).once(statsResponse);

    const getStatistic = getStatisticGenerator({
      jsonKey: 'hosts',
      textKey: 'hosts',
      primitive: Number,
      validate: value => !Number.isNaN(value)
    });

    const response1 = await getResponse('https://mockAddress.com');
    const hosts1 = await getStatistic(response1, 0);
    expect(hosts1).toBe(595);

    // fetch.mockResponseOnce(statsResponse);
    const response2 = await getResponse('https://mockAddress.com');
    const hosts2 = await getStatistic(response2, 1);
    expect(hosts2).toBe(594);
  });

  test('Generated function should return undefined when the specified validator returns false', async () => {
    fetch.mockResponseOnce(statsResponse);

    const getStatistic = getStatisticGenerator({
      jsonKey: 'chain_difficulty',
      textKey: 'chain difficulty',
      primitive: Number,
      validate: value => !Number.isNaN(value)
    });

    const response = await getResponse('https://mockAddress.com');
    const chainDiff = await getStatistic(response, 0);

    expect(chainDiff).toBeUndefined();
  });
});

describe('getPoolStatistics', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('Should return pool stats from a json response', async () => {
    fetch.mockResponseOnce(JSON.stringify(stateResponse.json));

    const response = await getResponse('https://mockAddress.com');
    const { hashrate, hosts, waitSyncBlocks, orphanBlocks } = getPoolStatistics(
      response
    );

    expect(hashrate).toBe(2009.28);
    expect(hosts).toBe(595);
    expect(waitSyncBlocks).toBe(72809);
    expect(orphanBlocks).toBe(6);
  });

  test('Should return pool stats from a text response', async () => {
    fetch.mockResponseOnce(statsResponse);

    const response = await getResponse('https://mockAddress.com');
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
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('Should find the network state from a response', async () => {
    fetch.once(stateResponse.on).once(stateResponse.connect);

    const response1 = await getResponse('https://mockAddress.com');
    const state1 = await getState(response1);
    expect(state1).toEqual(
      expect.objectContaining({
        type: 'ON',
        server_response: 'Synchronized with the main network. Normal operation.'
      })
    );

    const response2 = await getResponse('https://mockAddress.com');
    const state2 = await getState(response2);
    expect(state2).toEqual(
      expect.objectContaining({
        type: 'MAINTENANCE',
        server_response: 'Trying to connect to the main network.'
      })
    );
  });

  test(`Should return state "NO_RESPONSE" if getResponse() returned with { ..., success: false }`, async () => {
    fetch.mockResponseOnce(() => ({ ok: false }));

    const response = await getResponse('https://mockAddress.com');
    const state = await getState(response);

    expect(state).toEqual(
      expect.objectContaining({
        type: 'NO_RESPONSE',
        server_response: null
      })
    );
  });

  test(`Should return state "UNKNOWN" if getResponse() doesn't contain a valid state`, async () => {
    fetch.mockResponseOnce(stateResponse.invalid);

    const response = await getResponse('https://mockAddress.com');
    const state = await getState(response);

    expect(state).toEqual(
      expect.objectContaining({
        type: 'UNKNOWN',
        server_response: null
      })
    );
  });
});
