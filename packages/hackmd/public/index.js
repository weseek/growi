const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const dirPath = isProduction ? '.' : '../dist';
const stylesJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/hackmd-styles.mjs`));
const agentJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/hackmd-agent.mjs`));
const stylesCSSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/style.css`));

// export to app as string
module.exports = {
  stylesJS: stylesJSFile.toString(),
  agentJS: agentJSFile.toString(),
  stylesCSS: stylesCSSFile.toString().replace(/(\r\n|\n|\r)/gm, ''), // https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
};
