const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const dirPath = isProduction ? '.' : '../dist';
const stylesJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/styles.js`));
const agentJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/agent.js`));
const stylesCSSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/styles.css`));

// export to app as string
module.exports = {
  stylesJS: stylesJSFile.toString(),
  agentJS: agentJSFile.toString(),
  stylesCSS: stylesCSSFile.toString(),
};
