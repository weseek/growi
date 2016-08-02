import moment from 'moment';

export default class Template {

  constructor() {
    this.templatePattern = {
      'year': this.getYear,
      'month': this.getMonth,
      'date': this.getDate,
      'user': this.getUser,
    };
  }

  getYear() {
    return moment().format('YYYY');
  }

  getMonth() {
    return moment().format('YYYY/MM');
  }

  getDate() {
    return moment().format('YYYY/MM/DD');
  }

  getUser() {
    return '/user/sotarok';
  }

  getPageName(pageNameTemplate) {
    let pageName = pageNameTemplate;

    Object.keys(this.templatePattern).forEach(key => {
      const matcher = new RegExp(`{${key}}`, 'g');
      if (pageName.match(matcher)) {
        const replacer = this.templatePattern[key]();
        pageName = pageName.replace(matcher, replacer);
      }
    });

    return pageName;
  }

  process(code, lang) {
    const templateId = new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
    let pageName = lang;
    if (lang.match(':')) {
      pageName = this.getPageName(lang.split(':')[1]);
    }
    return `<button class="template-create-button btn btn-primary" data-template="${templateId}" data-path="${pageName}">${pageName} のページを作成する</button>
      <pre><code id="${templateId}" class="lang-${lang}">${code}\n</code></pre>\n`;
  }
}
