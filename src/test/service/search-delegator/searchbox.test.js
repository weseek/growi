const SearchboxDelegator = require('@server/service/search-delegator/searchbox');

describe('SearchboxDelegator test', () => {

  let delegator;

  describe('getConnectionInfo()', () => {

    let configManagerMock;
    let searchEventMock;

    beforeEach(() => {
      configManagerMock = {};
      searchEventMock = {};

      // setup mock
      configManagerMock.getConfig = jest.fn()
        .mockReturnValue('https://paas:7e530aafad58c892a8778827ae80c879@thorin-us-east-1.searchly.com');

      delegator = new SearchboxDelegator(configManagerMock, searchEventMock);
    });

    test('returns expected object', async() => {

      const { host, httpAuth, indexName } = delegator.getConnectionInfo();

      expect(configManagerMock.getConfig).toHaveBeenCalledWith('crowi', 'app:searchboxSslUrl');
      expect(host).toBe('https://paas:7e530aafad58c892a8778827ae80c879@thorin-us-east-1.searchly.com:443');
      expect(httpAuth).toBe('');
      expect(indexName).toBe('crowi');
    });

  });


});
