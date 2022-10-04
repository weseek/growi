import { Readable } from 'stream';

import { Types as MongooseTypes } from 'mongoose';

import TransferKeyModel from '~/server/models/transfer-key';
import loggerFactory from '~/utils/logger';
import { TransferKey } from '~/utils/vo/transfer-key';

const logger = loggerFactory('growi:service:g2g-transfer');

/**
 * Data used for comparing to/from GROWI information
 */
export type IDataFromGROWIInfo = {
  version: string
  userLimit: number
}

interface Pusher {
  /**
   * Start transfer data between GROWIs
   * @param {string} key Transfer key
   */
  startTransfer(key: string): Promise<Readable>
}

interface Receiver {
  /**
   * Check if key is not expired
   * @param {string} key Transfer key
   */
  validateTransferKey(key: string): Promise<boolean>
  /**
   * Check if transfering is proceedable
   * @param {IDataFromGROWIInfo} fromGROWIInfo
   */
  canTransfer(fromGROWIInfo: IDataFromGROWIInfo): Promise<boolean>
}

export class G2GTransferService implements Pusher, Receiver {

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any) {
    this.crowi = crowi;
  }

  public async canTransfer(fromGROWIInfo: IDataFromGROWIInfo): Promise<boolean> { return true }

  public async startTransfer(key: string): Promise<Readable> { return new Readable() }

  public async validateTransferKey(key: string): Promise<boolean> { return true }

  /**
   * This method receives appSiteUrl to create a TransferKey document and returns generated transfer key string.
   * UUID is the same value as the created document's _id.
   * @param {URL} appSiteUrl URL type appSiteUrl
   * @returns {string} Transfer key string (e.g. http://localhost:3000__grw_internal_tranferkey__<uuid>)
   */
  public async createTransferKey(appSiteUrl: URL): Promise<string> {
    const uuid = new MongooseTypes.ObjectId().toString();

    // Generate transfer key string
    let transferKeyString: string;
    try {
      transferKeyString = TransferKey.generateKeyString(uuid, appSiteUrl);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    // Save TransferKey document
    try {
      await TransferKeyModel.create({ _id: uuid, appSiteUrl, value: transferKeyString });
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return transferKeyString;
  }

  private onCompleteTransfer(): void { return }

}
