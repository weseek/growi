import csvToMarkdownTable from 'csv-to-markdown-table';

export default class CsvToTable {
  process(markdown) {

    // see: https://regex101.com/r/WR6IvX/2
    return markdown.replace(/```(\S+)[\r\n]((.|[\r\n])*?)[\r\n]```/gm, (all, group1, group2) => {
      switch (group1) {
        case 'tsv':
          return csvToMarkdownTable(group2, '\t');
          break;
        case 'tsv-h':
          return csvToMarkdownTable(group2, '\t', true);
          break;
        case 'csv':
          return csvToMarkdownTable(group2, ',');
          break;
        case 'csv-h':
          return csvToMarkdownTable(group2, ',', true);
          break;
        default:
          return all;
      }
    });
  }
}
