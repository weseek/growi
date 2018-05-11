let stream = undefined;

const bunyanFormat = require('bunyan-format');
stream = bunyanFormat({ outputMode: 'short' });

module.exports = stream;
