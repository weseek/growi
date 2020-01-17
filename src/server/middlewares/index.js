const fs = require('fs');
const path = require('path');

const initMiddlewares = (crowi) => {
  const basename = path.basename(__filename);
  const middlewares = {};

  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach((file) => {
      const Middleware = require(path.join(__dirname, file));
      middlewares[file.slice(0, -3)] = new Middleware(crowi);
    });

  return middlewares;
};

module.exports = initMiddlewares;
