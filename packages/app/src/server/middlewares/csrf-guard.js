// http method: PUT, POST
// custom header name: x-growi-system

// const logger = loggerFactory('growi:middlewares:auto-reconnect-to-search');

module.exports = () => {

  return async(req, res, next) => {
    if (req.method === 'PUT' || req.method === 'POST') {
      console.log('PUT or POST');
    }
    if (req.method === 'GET') {
      console.log('GET');
    }
    console.log('test');
    // if (req.method === 'PUT' || req.method === 'POST') {
    //   try () {
    //     // custom header name: x-growi-system
    //     return next();
    //   }
    //   catch(err) {
    //     logger.error('Request Authorization failed.', err);
    //   }
    return next();
  };

};
