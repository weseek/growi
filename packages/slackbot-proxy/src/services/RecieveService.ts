import { Service } from '@tsed/di';
import { SlashCommand } from '@slack/bolt';

@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:SlashCommand) : string {
    if (body.text === 'register') {
      console.log('register action occured');
      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
