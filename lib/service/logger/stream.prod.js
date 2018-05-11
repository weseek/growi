let stream = undefined;

const isFormat = !(process.env.FORMAT_NODE_LOG === 'false');

if (isFormat) {
  const bunyanFormat = require('bunyan-format');
  stream = bunyanFormat({ outputMode: 'long' });
}

module.exports = stream;
