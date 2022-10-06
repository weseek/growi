import MarkdownTable from '../../../../../app/src/client/models/MarkdownTable';

export const extract = (body, direction, index, operation, keyword) => {
  const hoge = MarkdownTable.fromMarkdownString(body);
  return hoge;
};
