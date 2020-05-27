
// filters the corresponding hotkeys that the user has pressed so far
// executes if there were keymap that fully matches what the user pressed
function processingCommand(userCommand, hotkeyList) {
  let userCommandVariable = userCommand;
  const commandExecuteList = hotkeyList.filter((value) => {
    return value.slice(0, userCommandVariable.length).toString() === userCommandVariable.toString();
  });
  if ((commandExecuteList.length === 1) && (commandExecuteList[0].toString() === userCommandVariable.toString())) {
    userCommandVariable = [];
  }
  return [commandExecuteList, userCommandVariable];
}


export function Hotkey(userCommand, hotkeyCommand) {
  const hotkeyCommandList = [];
  let commandExecuteList = [];
  let commandExecute = '';
  let userCommandVariable = userCommand;

  // making a list of hotkeyCommands values
  for (const key of Object.keys(hotkeyCommand)) {
    hotkeyCommandList.push(hotkeyCommand[key]);
  }

  // executing proccesingCommand function
  [commandExecuteList, userCommandVariable] = processingCommand(userCommandVariable, hotkeyCommandList);


  // if there was a fully matched hotkey
  if ((commandExecuteList.toString() !== [].toString()) && (userCommandVariable.toString() === [].toString())) {
    const keys = Object.keys(hotkeyCommand);
    for (let i = 0; i < keys.length; i++) {
      if (commandExecuteList[0].toString() === hotkeyCommand[keys[i]].toString()) {
        commandExecute = keys[i];
      }
    }// if the users key partly matches the hotkey
  }
  else if (commandExecuteList.toString() !== [].toString()) {
    commandExecute = commandExecuteList;
  }// if the users key doesn't match the hotkey at all.
  else {
    userCommandVariable = [];
  }
  return [commandExecute, userCommandVariable];
}

export default Hotkey;
