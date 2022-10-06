import MarkdownTable from '../../../../../app/src/client/models/MarkdownTable';
import { CalcMethod } from '../../../interfaces/calc';

/*
  direction:string 'col' or 'row'
  index:integer
  operation:string ex. '=='
  keyword:string
*/
export const extract = (mdTableText, direction, index, operation, keyword) => {
  const mdTable = MarkdownTable.fromMarkdownString(mdTableText);

  // Adjust index from plugin's to array's and validate value
  const arrIndex = index - 1;
  if ((direction === 'col' && arrIndex < 0)
      || (direction === 'row' && arrIndex < 1)) {
    throw Error(`Invalid index: ${index}`);
  }

  let colFilter;
  const colFilterWrapper = (row, compare) => row.some(col => col.includes(CalcMethod.SUM)) || compare;
  const colEqualFilter = row => colFilterWrapper(row, row[arrIndex] === keyword);
  const colLtFilter = row => colFilterWrapper(row, row[arrIndex] < keyword);
  const colLeFilter = row => colFilterWrapper(row, row[arrIndex] <= keyword);
  const colGtFilter = row => colFilterWrapper(row, row[arrIndex] > keyword);
  const colGeFilter = row => colFilterWrapper(row, row[arrIndex] >= keyword);
  switch (operation) {
    case '==': colFilter = colEqualFilter; break;
    case '<': colFilter = colLtFilter; break;
    case '<=': colFilter = colLeFilter; break;
    case '>': colFilter = colGtFilter; break;
    case '>=': colFilter = colGeFilter; break;
    default:
      throw Error('Unknown operation');
  }

  let rowFilter;
  const rowFilterWrapper = (item, compare) => item.includes(CalcMethod.SUM) || compare;
  const rowEqualFilter = item => rowFilterWrapper(item, item === keyword);
  const rowLtFilter = item => rowFilterWrapper(item, item < keyword);
  const rowLeFilter = item => rowFilterWrapper(item, item <= keyword);
  const rowGtFilter = item => rowFilterWrapper(item, item > keyword);
  const rowGeFilter = item => rowFilterWrapper(item, item >= keyword);
  switch (operation) {
    case '==': rowFilter = rowEqualFilter; break;
    case '<': rowFilter = rowLtFilter; break;
    case '<=': rowFilter = rowLeFilter; break;
    case '>': rowFilter = rowGtFilter; break;
    case '>=': rowFilter = rowGeFilter; break;
    default:
      throw Error('Unknown operation');
  }

  const header = mdTable.table[0]; // always leave header
  let extractedTable;
  if (direction === 'col') {
    extractedTable = [header].concat(mdTable.table.filter(colFilter));
  }
  if (direction === 'row') {
    extractedTable = [header].concat(mdTable.table[arrIndex].filter(rowFilter));
  }

  mdTable.table = extractedTable;
  return mdTable.toString();
};
