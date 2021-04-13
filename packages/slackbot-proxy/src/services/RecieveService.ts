import { Service } from '@tsed/di';
import { parseSlashCommand } from '@growi/slack';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:{[key:string]:string}) : string {
    const parseBody = parseSlashCommand(body);
    if (parseBody.growiCommandType === 'register') {
      console.log('register action occured');
      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
