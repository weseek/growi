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

    console.log("stringToArrayFilter value split!", value.split('\n'));
    return value.split('\n');
  },
};

