import { Service } from '@tsed/di';
import { SlashCommand } from '@slack/bolt';
import { parse } from '@growi/slack/src/utils/slash-command-parser';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:SlashCommand) : string {
    const parseBody = parse(body);
    if (parseBody.growiCommandType === 'register') {
      console.log('register action occured');
      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
