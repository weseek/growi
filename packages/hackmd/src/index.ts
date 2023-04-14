import fs from 'node:fs';
import path from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';
const dirPath = isProduction ? '.' : '../dist';
const stylesJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/hackmd-styles.js`));
const agentJSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/hackmd-agent.js`));
const stylesCSSFile = fs.readFileSync(path.resolve(__dirname, `${dirPath}/style.css`));

// export to app as string
const hackmdFiles = {
  stylesJS: stylesJSFile.toString(),
  agentJS: agentJSFile.toString(),
  stylesCSS: stylesCSSFile.toString().replace(/(\r\n|\n|\r)/gm, ''), // https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
};
export default hackmdFiles;
