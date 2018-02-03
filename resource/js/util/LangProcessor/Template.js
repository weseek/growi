import dateFnsFormat from 'date-fns/format';

export default class Template {

  constructor(crowi) {
    this.templatePattern = {
      'year': this.getYear,
      'month': this.getMonth,
      'date': this.getDate,
      'user': this.getUser,
    };
  }

  getYear() {
    return dateFnsFormat(new Date(), 'YYYY');
  }

  getMonth() {
    return dateFnsFormat(new Date(), 'YYYY/MM');
  }

  getDate() {
    return dateFnsFormat(new Date(), 'YYYY/MM/DD');
  }

  getUser() {
    // FIXME
    const username = window.crowi.me || null;

    if (!username) {
      return '';
    }

    return `/user/${username}`;
  }

  parseTemplateString(templateString) {
    let parsed = templateString;

    Object.keys(this.templatePattern).forEach(key => {
      const k = key .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(`{${k}}`, 'g');
      if (parsed.match(matcher)) {
        const replacer = this.templatePattern[key]();
        parsed = parsed.replace(matcher, replacer);
      }
    });

    return parsed;
  }

  process(code, lang) {
    const templateId = new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
    let pageName = lang;
    if (lang.match(':')) {
      pageName = this.parseTemplateString(lang.split(':')[1]);
    }
    code = this.parseTemplateString(code);

    const content = `
      <div class="page-template-builder">
        <button class="template-create-button btn btn-default" data-template="${templateId}" data-path="${pageName}#edit-form">
          <i class="fa fa-pencil"></i> ${pageName}
        </button>
        <pre><code id="${templateId}" class="lang-${lang}">${code}\n</code></pre>
      </div>`;

    // wrap with <pre-dummy>
    //   to avoid to be wrapped with <pre><code> by markdown-it
    return `<pre-dummy>${content}<pre-dummy>\n`;
  }
}
