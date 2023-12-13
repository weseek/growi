export const getElementByXpath = (xpath: string): Element | undefined => {
  const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  if (node instanceof Element) {
    return node;
  }
};
