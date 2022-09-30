import { Readable } from 'stream';

import { Types as MongooseTypes } from 'mongoose';

import TransferKeyModel from '~/server/models/transfer-key';
import loggerFactory from '~/utils/logger';
import { TransferKey } from '~/utils/vo/transfer-key';
import axios from 'axios';

const logger = loggerFactory('growi:service:g2g-transfer');

export const X_GROWI_TRANSFER_KEY_HEADER_NAME = 'x-growi-transfer-key';

/**
 * Data used for comparing to/from GROWI information
 */
export type IDataGROWIInfo = {
  version: string
  userLimit: number
  attachmentInfo: any
}

interface Pusher {
  /**
   * Send to-growi a request to get growi info
   * @param {TransferKey} tk Transfer key
   */
  askGROWIInfo(tk: TransferKey): Promise<IDataGROWIInfo>
  /**
   * Check if transfering is proceedable
   * @param {IDataGROWIInfo} fromGROWIInfo
   */
   canTransfer(fromGROWIInfo: IDataGROWIInfo): Promise<boolean>
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
   * This method receives appSiteUrl to create a TransferKey document and returns generated transfer key string.
   * UUID is the same value as the created document's _id.
   * @param {URL} appSiteUrl URL type appSiteUrl
   * @returns {string} Transfer key string (e.g. http://localhost:3000__grw_internal_tranferkey__<uuid>)
   */
   createTransferKey(appSiteUrl: URL): Promise<string>
   /**
    * Receive transfer request and import data.
    * @param {Readable} zippedGROWIDataStream
    * @returns {void}
    */
   receive(zippedGROWIDataStream: Readable): Promise<void>
}

export class G2GTransferPusherService implements Pusher {

  crowi: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any) {
    this.crowi = crowi;
  }

  public async askGROWIInfo(tk: TransferKey): Promise<IDataGROWIInfo> {
    // axios get
    // return IDataGROWIInfo

    return { userLimit: 100, version: '6.0.0', attachmentInfo: {} };
  }

  public async canTransfer(fromGROWIInfo: IDataGROWIInfo): Promise<boolean> {
    // Check if Transfer key is alive
    // Ask toGROWI about toGROWIInfo
    // Compare GROWIInfos

    return false;
  }

  public async startTransfer(transferKeyString: string): Promise<any> {
    let tk: TransferKey;
    try {
      tk = TransferKey.parse(transferKeyString);
    }
    catch (err) {
      logger.error(err);
      return Error('');
    }

    const { appUrl, key } = tk;

    await axios.post('/_api/v3/g2g-transfer/', { whatItShouldBe: 'a zip file' }, {
      baseURL: appUrl.origin,
      headers: {
        [X_GROWI_TRANSFER_KEY_HEADER_NAME]: key,
      },
    });
  }

}

export class G2GTransferReceiverService implements Receiver {

  public async validateTransferKey(transferKeyString: string): Promise<boolean> {
    // Parse to tk
    // Find active tkd

    return true;
  }

  public async createTransferKey(appSiteUrl: URL): Promise<string> {
    const uuid = new MongooseTypes.ObjectId().toString();

    // Generate transfer key string
    let transferKeyString: string;
    try {
      transferKeyString = TransferKey.generateKeyString(appSiteUrl, uuid);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    // Save TransferKey document
    let tkd;
    try {
      tkd = await TransferKeyModel.create({ _id: uuid, appSiteUrl, value: transferKeyString });
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return tkd.value;
  }

  public async receive(zippedGROWIDataStream: Readable): Promise<void> {
    // FIRST, Save from growi data into config
    // Maybe save status there as well (completed)
    // Receive a zip file via stream
    // Unzip
    // Import data
    // Call onCompleteTransfer when finished

    return;
  }

  /**
   * Sync DB, etc.
   * @returns {Promise<void>}
   */
  private async onCompleteTransfer(): Promise<void> { return }

}
