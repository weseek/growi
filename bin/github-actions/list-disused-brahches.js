/* eslint-disable no-console */

const { execSync } = require('child_process');

const EXCLUDE_TERM_DAYS = 14;

class BranchInfo {

  constructor(line) {
    const splitted = line.split('\t'); // split with '%09'

    this.authorDate = new Date(splitted[0].trim());
    this.authorName = splitted[1].trim();
    this.refName = splitted[2].trim();
    this.subject = splitted[3].trim();
  }

}

function getExcludeTermDate() {
  const date = new Date();
  date.setDate(date.getDate() - EXCLUDE_TERM_DAYS);
  return date;
}

async function main() {
  // exec git for-each-ref
  const out = execSync(`\
    git for-each-ref refs/remotes \
      --sort=-committerdate \
      --format='%(authordate:iso) %09 %(authorname) %09 %(refname:short) %09 %(subject)'
  `).toString();

  // parse
  const data = out
    .split('\n')
    .filter(v => v !== '') // trim empty string
    .map((line) => {
      return new BranchInfo(line);
    })
    .filter(branchInfo => branchInfo.authorDate < getExcludeTermDate()); // exclude data within EXCLUDE_TERM_DAYS

  console.log(data);
}

main();
