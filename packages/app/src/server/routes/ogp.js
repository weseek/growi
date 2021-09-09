module.exports = function(crowi, app) {
  return {
    ogp(req, res) {
      console.log('This is the route to display the ogp image');
      return res.end();
    },
  };
};
