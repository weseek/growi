// https://docs.google.com/spreadsheets/d/1FoYdyEraEQuWofzbYCDPKN7EdKgS_2ZrsDrOA8scgwQ
const DIAGRAMS_NET_LANG_MAP = {
  ja_JP: 'ja',
  zh_CN: 'zh',
};

export const getDiagramsNetLangCode = (lang) => {
  return DIAGRAMS_NET_LANG_MAP[lang];
};
