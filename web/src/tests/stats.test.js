const fetch = require('node-fetch');
const app = require('../app');

const port = 8181;
let server;

beforeAll(done => {
  server = app.listen({ port }, done);
});

afterAll(done => {
  server.close(done);
});

describe('Route: /stats', () => {
  let json;

  beforeAll(async () => {
    const response = await fetch('http://localhost:8181/stats');
    json = await response.json();
  });

  test('Should respond with success and data result', () => {
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('result');
  });

  test('Should contain data of all pools stats in an array', () => {
    expect(json.result.pools).toEqual(expect.any(Array));
    expect(json.result.pools[0].stats).toEqual(expect.any(Array));
  });

  test('Pools stats entry should contain 6 items', () => {
    expect(json.result.pools[0].stats[0].length).toBe(6);
  });

  test('Should contain data of network stats', () => {
    expect(json.result.network[0]).toEqual(expect.any(Array));
  });
});
