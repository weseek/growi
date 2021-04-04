import { Service } from '@tsed/di';

@Service()
export class ReceiveService {

  // body:any

  // constructor(body) {
  //   this.body = body;
  // }

  receive(body) {

    console.log('Receive Class', body);
    console.log('wai');
    return body;
  }

}
