export default class OrderedList {

  process(markdown) {
    const orderedListRE = /^(\s*)(\d+\.)(\s)(.*)+?/gm;
    const markdownTextGroupRE = /((?:[^\n][\n]?)+)/gm;

    const getItemListData = (itemList) => {
      const isValidList = itemList[0].split(/[\d]/)[0].length === 0;
      if (!isValidList) {
        return;
      }
      return itemList.map((item) => {
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
    };

    const getNestedOrderedListData = (itemListData) => {
      const result:any[] = [];
      const listItemNode:any[] = [result];
      if (itemListData?.length > 0) {
        itemListData.forEach((item) => {
          if (listItemNode[item.level - 1] != null) {
            listItemNode[item.level - 1].push({ ...item, children: listItemNode[item.level] = [] });
          }
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

    const replaceMarkdownWithHtml = (nestedItemListData) => {
      let occurrence = 0;
      occurrence++;
      if (occurrence === 1) {
        return buildList(nestedItemListData);
      }
      return '';

    };


    return markdown.replace(markdownTextGroupRE, (group) => {
      const itemList = group.match(orderedListRE);
      if (itemList != null) {
        const itemListData = getItemListData(itemList);
        const nestedItemListData = getNestedOrderedListData(itemListData);
        return nestedItemListData.length > 0 ? replaceMarkdownWithHtml(nestedItemListData) : group;
      }
      return group;
    });

  }

}
