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

describe('Route: /pools', () => {
  let json;

  beforeAll(async () => {
    const response = await fetch('http://localhost:8181/pools');
    json = await response.json();
  });

  test('Should respond with success and data result', () => {
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('result');
  });

  test('Should contain data of all pools', () => {
    expect(json.result).toEqual(expect.any(Array));

    json.result.forEach(pool => {
      expect(pool).toHaveProperty('id');
      expect(pool).toHaveProperty('name');
      expect(pool).toHaveProperty('website');
      expect(pool).toHaveProperty('location');
      expect(pool).toHaveProperty('location_coordinate');
      expect(pool).toHaveProperty('mining_address');
      expect(pool).toHaveProperty('payment_pool');
      expect(pool).toHaveProperty('payment_finder');
      expect(pool).toHaveProperty('payment_contributor');
      expect(pool).toHaveProperty('payment_community');
      expect(pool).toHaveProperty('version');
    });
  });
});
