import { parse } from '../utils/slash-command-parser';

export class RegisterService {

  receiveBody(parseBody) {
    const body = parse(parseBody);
    const commandType = body.growiCommandArgs;
    const commandArgs = body.growiCommandType;

    if (commandType === 'register') {
      this.openModal();
      return;
    }
  }

  openModal() {
    console.log('open');
  }


}
