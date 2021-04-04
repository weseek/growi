import { parse } from '../utils/slash-command-parser';


export class IndexService {

  // constructor(crowi) {
  //   this.crowi = crowi;
  // }
  receiveBody(parseBody) {
    const body = parse(parseBody);

    console.log(body);
  }


}
