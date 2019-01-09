const mockServer = require('./server');
const getResponse = require('../utils/getResponse');

let server;
const port = 8181;
const endpoint = `http://localhost:${port}`;

beforeAll(done => {
  server = mockServer.listen({ port }, done);
});

afterAll(done => {
  server.close(done);
});

describe('getResponse', () => {
  test('Should fetch an URL and return an object { success, body, type }', async () => {
    const response = await getResponse(`${endpoint}/state`);

    expect(response).toEqual(
      expect.objectContaining({
        success: true,
        type: 'text',
        body: 'XDAG 0.2.5 Synchronized with the main network. Normal operation.'
      })
    );
  });

  test('Should try to return the body as JSON', async () => {
    const response = await getResponse(`${endpoint}/json-state`);

    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('type', 'json');
    expect(response.body).toBeInstanceOf(Object);
  });

  test('Should timeout after 10 seconds and return { ..., success: false }', async () => {
    const response = await getResponse(`${endpoint}/timeout`);

    expect(response).toEqual(
      expect.objectContaining({
        success: false
      })
    );
  }, 11000);

  test('Should return { ..., success: false } on a non 2xx http code', async () => {
    const response = await getResponse(`${endpoint}/404`);

    expect(response).toEqual(
      expect.objectContaining({
        success: false
      })
    );
  });
});
