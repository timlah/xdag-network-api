let responseChain = [];

const mockQueryResponse = nextResponse => {
  responseChain.push(nextResponse);
};

const mockManyQueryResponses = responses => {
  responseChain = responses;
};

module.exports = {
  mockQueryResponse,
  mockManyQueryResponses,
  query: str => {
    const response =
      responseChain.length > 1 ? responseChain.shift() : responseChain[0];
    return Promise.resolve(response);
  }
};
