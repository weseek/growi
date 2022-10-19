const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const dirPath = isProduction ? '.' : '../dist';
const stylesJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/styles.js`));
const agentJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/agent.js`));
const stylesCSSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/styles.css`));

// export to app as string
export const stylesJS = stylesJSFile.toString();
export const agentJS = agentJSFile.toString();
export const stylesCSS = stylesCSSFile.toString();
