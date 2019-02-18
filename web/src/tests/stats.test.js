const fetch = require('node-fetch');
const express = require('express');

const route = require('../routes/stats');

const queryResponses = {
  pools: [
    {
      pools: [
        {
          id: '2f60af82-6f61-4b60-8994-86f193987118',
          stats: [
            [1550498400, 16324.11, 'ON', 5, 1462, 623],
            [1550498460, 16236.86, 'ON', 5, 1462, 623]
          ]
        },
        {
          id: '350fe4ec-5c6f-49aa-a381-5a135d8ea39e',
          stats: [
            [1550498400, 9190766.06, 'ON', 4, 65407, 623],
            [1550498460, 8451375.21, 'ON', 5, 65407, 623]
          ]
        }
      ]
    }
  ],
  network: [
    {
      network: [
        [
          1550498400,
          43252559.88,
          564287488,
          228774842,
          551062,
          624,
          '183036475790037795441236084718164'
        ],
        [
          1550498460,
          43059338.58,
          564261888,
          228773610,
          551037,
          624,
          '183035572099537244968711271363780'
        ]
      ]
    }
  ]
};

require('../db').mockManyQueryResponses([
  queryResponses.pools,
  queryResponses.network,
  queryResponses.pools,
  queryResponses.network,
  queryResponses.pools,
  queryResponses.network
]);

jest.mock('../db');

require('../utils/channel');

jest.mock('../utils/channel');

const app = express();
const port = 8181;
let server;

app.use('/stats', route);

beforeAll(done => {
  server = app.listen({ port }, done);
});

afterAll(done => {
  server.close(done);
});

describe('Route: /stats', () => {
  let json;

  beforeAll(async () => {
    const response = await fetch(`http://localhost:${port}/stats`);
    json = await response.json();
  });

  test('Should respond with success and data result', () => {
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('result');
  });

  test('Should contain keys for pools and network stats', () => {
    expect(json.result).toHaveProperty('pools');
    expect(json.result.pools).toEqual(expect.any(Array));
    expect(json.result).toHaveProperty('network');
    expect(json.result.network).toEqual(expect.any(Array));
  });

  test('Pool stats should have the desired structure', () => {
    json.result.pools.forEach(({ id, stats }) => {
      expect(id).toEqual(expect.any(String));
      expect(stats).toEqual(expect.any(Array));

      stats.forEach(entry => {
        expect(entry).toEqual(expect.any(Array));
        expect(entry).toHaveLength(6);
      });
    });
    expect(json.result).toHaveProperty('pools');
    expect(json.result).toHaveProperty('network');
  });

  test('Network stats should have the desired structure', () => {
    json.result.network.forEach(entry => {
      expect(entry).toEqual(expect.any(Array));
      expect(entry).toHaveLength(7);
    });
    expect(json.result).toHaveProperty('pools');
    expect(json.result).toHaveProperty('network');
  });
});

describe('Route: /stats/day', () => {
  let json;

  beforeAll(async () => {
    const response = await fetch(`http://localhost:${port}/stats/day`);
    json = await response.json();
  });

  test('Should respond with success and data result', () => {
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('result');
  });

  test('Should contain keys for pools and network stats', () => {
    expect(json.result).toHaveProperty('pools');
    expect(json.result.pools).toEqual(expect.any(Array));
    expect(json.result).toHaveProperty('network');
    expect(json.result.network).toEqual(expect.any(Array));
  });

  test('Pool stats should have the desired structure', () => {
    json.result.pools.forEach(({ id, stats }) => {
      expect(id).toEqual(expect.any(String));
      expect(stats).toEqual(expect.any(Array));

      stats.forEach(entry => {
        expect(entry).toEqual(expect.any(Array));
        expect(entry).toHaveLength(6);
      });
    });
    expect(json.result).toHaveProperty('pools');
    expect(json.result).toHaveProperty('network');
  });

  test('Network stats should have the desired structure', () => {
    json.result.network.forEach(entry => {
      expect(entry).toEqual(expect.any(Array));
      expect(entry).toHaveLength(7);
    });
    expect(json.result).toHaveProperty('pools');
    expect(json.result).toHaveProperty('network');
  });
});

describe('Route: /stats/month', () => {
  let json;

  beforeAll(async () => {
    const response = await fetch(`http://localhost:${port}/stats/month`);
    json = await response.json();
  });

  test('Should respond with success and data result', () => {
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('result');
  });

  test('Should contain keys for pools and network stats', () => {
    expect(json.result).toHaveProperty('pools');
    expect(json.result.pools).toEqual(expect.any(Array));
    expect(json.result).toHaveProperty('network');
    expect(json.result.network).toEqual(expect.any(Array));
  });

  test('Pool stats should have the desired structure', () => {
    json.result.pools.forEach(({ id, stats }) => {
      expect(id).toEqual(expect.any(String));
      expect(stats).toEqual(expect.any(Array));

      stats.forEach(entry => {
        expect(entry).toEqual(expect.any(Array));
        expect(entry).toHaveLength(6);
      });
    });
    expect(json.result).toHaveProperty('pools');
    expect(json.result).toHaveProperty('network');
  });

  test('Network stats should have the desired structure', () => {
    json.result.network.forEach(entry => {
      expect(entry).toEqual(expect.any(Array));
      expect(entry).toHaveLength(7);
    });
    expect(json.result).toHaveProperty('pools');
    expect(json.result).toHaveProperty('network');
  });
});
