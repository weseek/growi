import dateFnsFormat from 'date-fns/format';

export default class CrowiTemplate {

  constructor(crowi) {
    this.templatePattern = {
      'year': this.getYear,
      'month': this.getMonth,
      'date': this.getDate,
      'user': this.getUser,
    };
  }

  process(markdown) {
    // see: https://regex101.com/r/WR6IvX/3
    return markdown.replace(/:::\s*(\S+)[\r\n]((.|[\r\n])*?)[\r\n]:::/gm, (all, group1, group2) => {
      const lang = group1;
      let code = group2;

      if (!lang.match(/^template/)) {
        return all;
      }

      const templateId = new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
      let pageName = lang;
      if (lang.match(':')) {
        pageName = this.parseTemplateString(lang.split(':')[1]);
      }
      code = this.parseTemplateString(code);

      return (
        /* eslint-disable quotes */
        `<div class="page-template-builder">` +
          `<button class="template-create-button btn btn-default" data-template="${templateId}" data-path="${pageName}">` +
            `<i class="fa fa-pencil"></i> ${pageName}` +
          `</button>` +
          `<pre><code id="${templateId}" class="lang-${lang}">${code}\n</code></pre>` +
        `</div>`
        /* eslint-enable */
      );
    });
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
      const k = key .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matcher = new RegExp(`{${k}}`, 'g');
      if (parsed.match(matcher)) {
        const replacer = this.templatePattern[key]();
        parsed = parsed.replace(matcher, replacer);
      }
    });

    return parsed;
  }

}
