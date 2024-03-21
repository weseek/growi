const addLogs = (log, newLogMessage, newLogCode = undefined) => {

  let newLog;
  if (newLogCode == null) {
    newLog = `${new Date()} - ${newLogMessage}\n\n`;
  }
  else {
    newLog = `${new Date()} - ${newLogCode}, ${newLogMessage}\n\n`;
  }

  if (log == null) {
    return newLog;
  }
  return `${newLog}${log}`;
};

export {
  // eslint-disable-next-line import/prefer-default-export
  addLogs,
};
