import { Service } from '@tsed/di';
import { parse } from '@growi/slack/src/utils/slash-command-parser';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:{[key:string]:string}) : string {
    const parseBody = parse(body);
    if (parseBody.growiCommandType === 'register') {
      console.log('register action occured');
      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
