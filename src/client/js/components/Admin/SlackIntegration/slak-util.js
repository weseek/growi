const addLogs = (log, connectionMessage, setConnectionMessage) => {
  const newLog = `${new Date()} - ${log.code}, ${log.message}\n\n`;
  if (connectionMessage == null) {
    return setConnectionMessage(newLog);
  }
  return setConnectionMessage(`${newLog}${connectionMessage}`);
};

export {
  // eslint-disable-next-line import/prefer-default-export
  addLogs,
};
