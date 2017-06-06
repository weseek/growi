
export default class Tsv2Table {

  constructor(crowi, option) {
    if (!option) {
      option = {};
    }
    this.option = option;

    this.option.header = this.option.header || false;
  }
  getCols(codeLines) {
    let max = 0;

    for (let i = 0; i < codeLines ; i++) {
      if (max < codeLines.length) {
        max = codeLines.length;
      }
    }

    return max;
  }

  splitColums(line) {
    // \t is replaced to '    ' by Lexer.lex(), so split by 4 spaces
    return line.split(/\s{4}/g);
  }

  getTableHeader(codeLines, option) {
    let headers = [];
    let headLine = (codeLines[0] || '');

    //console.log('head', headLine);
    headers = this.splitColums(headLine).map(col => {
      return `<th>${Crowi.escape(col)}</th>`;
    });

    if (headers.length < option.cols) {
      headers.concat(new Array(option.cols - headers.length));
    }

    return `<tr>
      ${headers.join('\n')}
    </tr>`;
  }

  getTableBody(codeLines, option) {
    let rows;

    if (this.option.header) {
      codeLines.shift();
    }

    rows = codeLines.map(row => {
      const cols = this.splitColums(row).map(col => {
        return `<td>${Crowi.escape(col)}</td>`;
      }).join('');
      return `<tr>${cols}</tr>`;
    });

    return rows.join('\n');
  }

  process(code) {
    let option = {};
    const codeLines = code.split(/\n|\r/);

    option.cols = this.getCols(codeLines);

    let header = '';
    if (this.option.header) {
      header = `<thead>
        ${this.getTableHeader(codeLines, option)}
      </thead>`;
    }

    return `<table>
      ${header}
      <tbody>
        ${this.getTableBody(codeLines, option)}
      </tbody>
    </table>`;
  }
}
