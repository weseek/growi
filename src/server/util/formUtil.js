'use strict';

module.exports = {
  normalizeCRLFFilter: function(value) {
    return value
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    ;
  },
  stringToArrayFilter: function(value) {
    if (!value || value === '') {
      return [];
    }

    return value.split('\n');
  },
};

