
const isTrashPage = (path) => {
  if (path.match(/^\/trash(\/.*)?$/)) {
    return true;
  }

  return false;
};

module.exports = {
  isTrashPage,
};
