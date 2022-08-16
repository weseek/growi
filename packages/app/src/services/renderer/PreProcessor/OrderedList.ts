export default class OrderedList {

  process(markdown) {
    const orderedListRE = /^(\s*)(\d+\.)(\s)(.*)+?/gm;

    const itemList = markdown.match(orderedListRE);
    const itemListData = itemList?.map((item) => {
      const indent = item.split(/[\d]/)[0].length;
      const itemNumber = item.trim().split('.')[0];
      const content = item.split(/\d.\s/)[1];
      const level = Math.round(indent / 4) + 1;
      return {
        number: itemNumber,
        content,
        level,
      };
    });

    const getNestedOrderedListData = (itemListData) => {
      const result:any[] = [];
      const levels:any[] = [result];
      if (itemListData.length > 0) {
        itemListData.forEach((item) => {
          console.log(item);
          levels[item.level - 1].push({ ...item, children: levels[item.level] = [] });
        });
        return result;
      }
      return result;
    };

    const buildList = (itemListData) => {
      if (itemListData == null || itemListData.length === 0) {
        return '';
      }
      let element = `<ol start=${itemListData[0].number}>`;
      element += itemListData.map((item) => {
        return `<li class="code-line"> ${item.content}</li> ${buildList(item.children)}`;
      }).join('');
      element += '</ol>';
      return element;

    };
    const nestedItemListData = getNestedOrderedListData(itemListData);
    const getMarkdownRepacement = () => {
      let occurrence = 0;
      return markdown.replace(orderedListRE, () => {
        occurrence++;
        if (occurrence === 1) return buildList(nestedItemListData);
        return '';
      });
    };
    return getMarkdownRepacement();

  }

}
