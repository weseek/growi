export default class OrderedList {

  process(markdown, context) {

    const orderedListRE = /^(\s*)(\d+\.)(\s)(.*)+?/gm;

    const itemList = markdown.match(orderedListRE);
    const itemListData = itemList?.map((item) => {
      const indent = item.split(/[\d]/)[0].length;
      const itemNumber = item.trim().split('.')[0];
      const content = item.split(/\d.\s/)[1];
      return {
        indent,
        number: itemNumber,
        content,
      };
    });

    const getChild = (listObject, indent) => {
      let child = null;
      listObject.every((list) => {
        child = list;
        return !(list.indent > indent);
      });
      return child;
    };
    const contentListWIthChild = itemListData.map((list, index) => {
      const isLastElementOfSameIndent = () => {
        if (index === itemListData.length - 1) {
          return true;
        }
        return itemListData[index].indent === itemListData[index + 1].indent;
      };
      return {
        ...list,
        child: isLastElementOfSameIndent() ? null : getChild(itemListData, list.indent),
      };
    });
    const createList = (node) => {
      let element = '<ol>';
      if (node.child == null) {
        element += `<li>${node.content}</li></ol>`;
      }
      else {
        element += node.child.map((childItem) => {
          return createList(childItem);
        });
      }
      return element;
    };
    // TODO: - Create nested data list from matched markdown
    //       - Create HTML verison of ordered list
    //       - Replace Markdown with HTML ordered list

    return markdown;

  }

}
