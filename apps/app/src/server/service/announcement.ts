import Crowi from '../crowi';


export default class AnnouncementService {

  crowi!: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;

    this.getReadRate = this.getReadRate.bind(this);
    this.upsertByActivity = this.upsertByActivity.bind(this);
  }

  getReadRate = async() => {};

  upsertByActivity = async() => {};

}
