import loggerFactory from '~/utils/logger';

// don't add any more middlewares to this file.
// all new middlewares should be an independent file under /server/middlewares
// eslint-disable-next-line no-unused-vars

const { pathUtils } = require('@growi/core');
const { formatDistanceStrict } = require('date-fns');
const entities = require('entities');

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:lib:middlewares');

module.exports = (crowi) => {
  const { configManager } = crowi;

  const middlewares = {};

  middlewares.swigFunctions = function() {
    return function(req, res, next) {
      require('../util/swigFunctions')(crowi, req, res.locals);
      next();
    };
  };

  middlewares.swigFilters = function(swig) {

    return function(req, res, next) {
      swig.setFilter('path2name', (string) => {
        const name = string.replace(/(\/)$/, '');

        if (name.match(/.+\/([^/]+\/\d{4}\/\d{2}\/\d{2})$/)) { // /.../hoge/YYYY/MM/DD 形式のページ
          return name.replace(/.+\/([^/]+\/\d{4}\/\d{2}\/\d{2})$/, '$1');
        }
        if (name.match(/.+\/([^/]+\/\d{4}\/\d{2})$/)) { // /.../hoge/YYYY/MM 形式のページ
          return name.replace(/.+\/([^/]+\/\d{4}\/\d{2})$/, '$1');
        }
        if (name.match(/.+\/([^/]+\/\d{4})$/)) { // /.../hoge/YYYY 形式のページ
          return name.replace(/.+\/([^/]+\/\d{4})$/, '$1');
        }

        return name.replace(/.+\/(.+)?$/, '$1'); // ページの末尾を拾う
      });

      swig.setFilter('normalizeDateInPath', (path) => {
        const patterns = [
          [/20(\d{2})(\d{2})(\d{2})(.+)/g, '20$1/$2/$3/$4'],
          [/20(\d{2})(\d{2})(\d{2})/g, '20$1/$2/$3'],
          [/20(\d{2})(\d{2})(.+)/g, '20$1/$2/$3'],
          [/20(\d{2})(\d{2})/g, '20$1/$2'],
          [/20(\d{2})_(\d{1,2})_(\d{1,2})_?(.+)/g, '20$1/$2/$3/$4'],
          [/20(\d{2})_(\d{1,2})_(\d{1,2})/g, '20$1/$2/$3'],
          [/20(\d{2})_(\d{1,2})_?(.+)/g, '20$1/$2/$3'],
          [/20(\d{2})_(\d{1,2})/g, '20$1/$2'],
        ];

        for (let i = 0; i < patterns.length; i++) {
          const mat = patterns[i][0];
          const rep = patterns[i][1];
          if (path.match(mat)) {
            return path.replace(mat, rep);
          }
        }

        return path;
      });

      swig.setFilter('datetz', (input, format) => {
        // timezone
        const swigFilters = require('swig-templates/lib/filters');
        return swigFilters.date(input, format, crowi.appService.getTzoffset());
      });

      swig.setFilter('dateDistance', (input) => {
        return formatDistanceStrict(input, new Date());
      });

      swig.setFilter('nl2br', (string) => {
        return string
          .replace(/\n/g, '<br>');
      });

      swig.setFilter('removeTrailingSlash', (string) => {
        return pathUtils.removeTrailingSlash(string);
      });

      swig.setFilter('addTrailingSlash', (string) => {
        return pathUtils.addTrailingSlash(string);
      });

      swig.setFilter('presentation', (string) => {
        // 手抜き
        return string
          .replace(/\s(https?.+(jpe?g|png|gif))\s/, '\n\n\n![]($1)\n\n\n');
      });

      swig.setFilter('encodeHTML', (string) => {
        return entities.encodeHTML(string);
      });

      swig.setFilter('preventXss', (string) => {
        return crowi.xss.process(string);
      });

      swig.setFilter('slice', (list, start, end) => {
        return list.slice(start, end);
      });

      swig.setFilter('push', (list, element) => {
        list.push(element);
        return list;
      });

      next();
    };
  };

  middlewares.awsEnabled = function() {
    return function(req, res, next) {
      if ((configManager.getConfig('crowi', 'aws:s3Region') !== '' || this.configManager.getConfig('crowi', 'aws:s3CustomEndpoint') !== '')
          && configManager.getConfig('crowi', 'aws:s3Bucket') !== ''
          && configManager.getConfig('crowi', 'aws:s3AccessKeyId') !== ''
          && configManager.getConfig('crowi', 'aws:s3SecretAccessKey') !== '') {
        req.flash('globalError', req.t('message.aws_sttings_required'));
        return res.redirect('/');
      }

      return next();
    };
  };

  return middlewares;
};
