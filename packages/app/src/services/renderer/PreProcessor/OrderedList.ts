type ItemListDataType = {
  number: number,
  content: string,
  level: number
}

type NestedItemListDataType = ItemListDataType & {
  children?: NestedItemListDataType[] | null
}
export default class OrderedList {

  process(markdown) {
    // Pattern to match ordered list
    // https://regex101.com/r/JnvoLK/1
    const orderedListRE = /^(\s*)(\d+[.)])(\s)(.*)+?/gm;

    // Regex to grouping markdown by new line
    // https://regex101.com/r/KJDb1J/1
    const markdownTextGroupRE = /((?:[^\n][\n]?)+)/gm;

    const getItemListData = (itemList: string[]): ItemListDataType[] | null => {
      const isValidList = itemList[0].split(/[\d]/)[0].length === 0;
      if (!isValidList) {
        return null;
      }
      return itemList.map((item) => {
        const indent = item.split(/[\d]/)[0].length;
        const itemNumber = Number(item.trim().split(/[.)]/)[0]);
        const content = item.split(/\d.\s/)[1];
        const level = Math.round(indent / 4) + 1;
        return {
          number: itemNumber,
          content,
          level,
        };
      });
    };

    const getNestedOrderedListData = (itemListData: ItemListDataType[]): NestedItemListDataType[] => {
      const result:NestedItemListDataType[] = [];
      const listItemNode: NestedItemListDataType[][] = [result];
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

    const buildList = (nestedItemListData: NestedItemListDataType[]): string => {
      if (nestedItemListData == null || nestedItemListData.length === 0) {
        return '';
      }
      let element = `<ol start=${nestedItemListData[0].number}>`;
      element += nestedItemListData.map((item) => {
        if (item.children != null) {
          return `<li class="code-line"> ${item.content}</li> ${buildList(item.children)}`;
        }
        return `<li class="code-line"> ${item.content}</li>`;
      }).join('');
      element += '</ol>';
      return element;
    };

    const replaceMarkdownWithHtml = (nestedItemListData: NestedItemListDataType[]): string => {
      let occurrence = 0;
      occurrence++;
      if (occurrence === 1) {
        return buildList(nestedItemListData);
      }
      return '';

    };


    return markdown.replace(markdownTextGroupRE, (group: string) => {
      const itemList = group.match(orderedListRE);
      const itemListData = itemList != null ? getItemListData(itemList) : null;
      if (itemListData != null) {
        const nestedItemListData = getNestedOrderedListData(itemListData);
        return nestedItemListData.length > 0 ? replaceMarkdownWithHtml(nestedItemListData) : group;
      }
      return group;
    });

  }

}
