const { format } = require('date-fns');

/**
 * Format any text
 * @param {*} date string
 * @param {*} formatType string
 */
const formatDateToDisplay = (date, formatType = 'yyyy/MM/dd HH:mm') => {
  return format(new Date(date), formatType);
};

module.exports = {
  formatDateToDisplay,
};
