const fetch = require('jest-fetch-mock');

const getPoolResponse = require('../utils/getPoolResponse');

describe('getPoolResponse', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('Should fetch an URL and return an object with { success, body, type }', async () => {
    fetch.mockResponseOnce(
      'XDAG 0.2.5 Synchronized with the main network. Normal operation.'
    );
    const response = await getPoolResponse('https://mockAddress.com');

    expect(response).toEqual(
      expect.objectContaining({
        success: true,
        type: 'text',
        body: 'XDAG 0.2.5 Synchronized with the main network. Normal operation.'
      })
    );
  });

  test('Should try to return the body as JSON', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
    const response = await getPoolResponse('https://mockAddress.com');

    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('type', 'json');
    expect(response.body).toBeInstanceOf(Object);
  });

  test('Should return { ..., success: false } on a non 2xx http code', async () => {
    fetch.mockResponseOnce('', { status: 404 });
    const response = await getPoolResponse('https://mockAddress.com');

    expect(response).toEqual(
      expect.objectContaining({
        success: false
      })
    );
  });
});
