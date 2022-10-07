import { sum } from 'lodash';

import MarkdownTable from '../../../../app/src/client/models/MarkdownTable';
import { CalcMethod } from '../../interfaces/calc';


const getCalcPosition = (array: Array<string>): number[] => {
  const calcPosition: number[] = [];
  array.forEach((s, index) => {
    if (s === CalcMethod.SUM) {
      calcPosition.push(index);
    }
  });
  return calcPosition;
};

const getCalculatedCollomNumber = (position: number, tableData: string[]) => {
  const collom = tableData.map(data => data[position]);

  const numberList: number[] = [];

  collom.forEach((n) => {
    const num = Number(n);
    if (!Number.isNaN(num)) {
      numberList.push(num);
    }
  });

  return sum(numberList);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const calc = (body: string) => {

  const mdTable = MarkdownTable.fromMarkdownString(body);

  // If calcMethod does not exist in the last line, return body as is
  const calcPositions = getCalcPosition(mdTable.table.pop());
  if (calcPositions.length === 0) {
    return body;
  }

  const calcLine = [...Array(mdTable.table[0].length)].map(() => '');
  calcPositions.forEach((position) => {
    const sum = getCalculatedCollomNumber(position, mdTable.table);
    calcLine[position] = String(sum);
  });

  mdTable.table.push(calcLine);
  return mdTable.toString();
};
