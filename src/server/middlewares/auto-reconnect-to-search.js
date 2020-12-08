const { ReconnectContext, nextTick } = require('../service/search-reconnect-context/reconnect-context');

module.exports = (crowi) => {
  const { searchService } = crowi;
  const reconnectContext = new ReconnectContext();
  const reconnectHandler = () => {
    searchService.reconnectClient();
    return searchService.isReachable;
  };

  return (req, res, next) => {
    if (searchService != null && !searchService.isReachable) {
      nextTick(reconnectContext, reconnectHandler);
    }

    return next();
  };
};
