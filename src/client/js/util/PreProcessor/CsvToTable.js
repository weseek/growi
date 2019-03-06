import csvToMarkdownTable from 'csv-to-markdown-table';

export default class CsvToTable {
  process(markdown) {

    // see: https://regex101.com/r/WR6IvX/3
    return markdown.replace(/:::\s*(\S+)[\r\n]((.|[\r\n])*?)[\r\n]:::/gm, (all, group1, group2) => {
      switch (group1) {
        case 'tsv':
          return csvToMarkdownTable(group2, '\t');
        case 'tsv-h':
          return csvToMarkdownTable(group2, '\t', true);
        case 'csv':
          return csvToMarkdownTable(group2, ',');
        case 'csv-h':
          return csvToMarkdownTable(group2, ',', true);
        default:
          return all;
      }
    });
  }
}
