const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const stylesJSFile = fs.readFileSync(path.resolve(__dirname, isProduction ? './styles.js' : '../dist/styles.js'));
const agentJSFile = fs.readFileSync(path.resolve(__dirname, isProduction ? './agent.js' : '../dist/agent.js'));
const stylesCSSFile = fs.readFileSync(path.resolve(__dirname, isProduction ? './styles.css' : '../dist/styles.css'));

// export to app as string
export const stylesJS = stylesJSFile.toString();
export const agentJS = agentJSFile.toString();
export const stylesCSS = stylesCSSFile.toString();
