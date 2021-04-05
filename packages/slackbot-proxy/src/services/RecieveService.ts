import { SlashCommand } from '@slack/bolt';
import { Service } from '@tsed/di';
import { parse } from '../../../slack/src/utils/slash-command-parser';
import { openRegisterModal } from './RegisterService';


@Service()
export class ReceiveService {

  receiveContentsFromSlack(body:SlashCommand) : string {
    console.log(body);
    const parseBody = parse(body);
    console.log(parseBody);
    if (body.text === 'register') {
      openRegisterModal(body);

      return 'register action occurd';
    }
    return 'return receiveContentsFromSlack';
  }

}
