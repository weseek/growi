/* eslint-disable no-console */

/*
 * USAGE:
 *  node list-branches [OPTION]
 *
 * OPTIONS:
 *  --disused : Return disused branches (default)
 *  --illegal : Return illegal named branches
 */

const { execSync } = require('child_process');

const EXCLUDE_TERM_DAYS = 14;
const EXCLUDE_PATTERNS = [
  /feat\/custom-sidebar-2$/,
  // https://regex101.com/r/Lnx7Pz/2
  /dev\/[\d.x]*$/,
];

class BranchSummary {

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

function getBranchSummaries() {
  // exec git for-each-ref
  const out = execSync(`\
    git for-each-ref refs/remotes \
      --sort=-committerdate \
      --format='%(authordate:iso) %09 %(authorname) %09 %(refname:short) %09 %(subject)'
  `).toString();

  // parse
  const branchSummaries = out
    .split('\n')
    .filter(v => v !== '') // trim empty string
    .map(line => new BranchSummary(line))
    .filter((branchInfo) => { // exclude branches that matches to patterns
      return !EXCLUDE_PATTERNS.some(pattern => pattern.test(branchInfo.refName));
    });

  return branchSummaries;
}

async function main() {
  const args = process.argv.slice(2);

  const branchSummaries = getBranchSummaries();

  const outdated = branchSummaries
    .filter(branchInfo => branchInfo.authorDate < getExcludeTermDate()); // exclude data within EXCLUDE_TERM_DAYS

  console.log(outdated);
}

main();
