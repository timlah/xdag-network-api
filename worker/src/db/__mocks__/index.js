let response;

const mockQueryResponse = nextResponse => {
  response = nextResponse;
};

module.exports = {
  mockQueryResponse,
  query: str => Promise.resolve(response)
};
