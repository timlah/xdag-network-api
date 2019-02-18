const fetch = require('node-fetch');
const express = require('express');

const route = require('../routes/pools');

jest.mock('../db');
require('../db').mockQueryResponse([
  {
    payment_pool: '1',
    payment_finder: '1',
    payment_contributor: '1',
    payment_community: '1',
    id: '3eebc851-f07f-42c2-84ab-34fe0aa209b3',
    location: 'Poland',
    location_coordinate: { x: 19.9167, y: 50.0833 },
    name: 'corpopool.com',
    website: 'http://www.corpopool.com/',
    mining_address: ['xdag.corpopool.com:443'],
    version: null
  },
  {
    payment_pool: '1',
    payment_finder: '98',
    payment_contributor: '0',
    payment_community: '1',
    id: '350fe4ec-5c6f-49aa-a381-5a135d8ea39e',
    location: 'Germany',
    location_coordinate: { x: 11.6012, y: 48.3233 },
    name: 'xdag.org Germany #2',
    website: 'https://xdag.org/',
    mining_address: ['de2.xdag.org:13655'],
    version: '0.3.0'
  }
]);

const app = express();
const port = 8181;
let server;

app.use('/pools', route);

beforeAll(done => {
  server = app.listen({ port }, done);
});

afterAll(done => {
  server.close(done);
});

describe('Route: /pools', () => {
  let json;

  beforeAll(async () => {
    const response = await fetch(`http://localhost:${port}/pools`);
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
