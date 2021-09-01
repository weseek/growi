import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

import { RelationMock } from '~/entities/relation-mock';
import { RelationMockRepository } from '~/repositories/relation-mock';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:RelationsService');

@Service()
export class RelationsService {

  @Inject()
  relationMockRepository: RelationMockRepository;

  async getSupportedGrowiCommands(relationMock:RelationMock):Promise<any> {
    // generate API URL
    const url = new URL('/_api/v3/slack-integration/supported-commands', relationMock.growiUri);
    return axios.get(url.toString(), {
      headers: {
        'x-growi-ptog-tokens': relationMock.tokenPtoG,
      },
    });
  }

  async syncSupportedGrowiCommands(relationMock:RelationMock): Promise<RelationMock> {
    const res = await this.getSupportedGrowiCommands(relationMock);

    // MOCK DATA MODIFY THIS GW-6972 ---------------
    /**
     * this code represents the update of cache (Relation schema) using request from GROWI
     */
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = res.data.data;
    if (relationMock !== null) {
      relationMock.permissionsForBroadcastUseCommands = permissionsForBroadcastUseCommands;
      relationMock.permissionsForSingleUseCommands = permissionsForSingleUseCommands;
      relationMock.expiredAtCommands = addHours(new Date(), 48);
      return this.relationMockRepository.save(relationMock);
    }
    throw Error('No relation mock exists.');
    // MOCK DATA MODIFY THIS GW-6972 ---------------
  }

  // MODIFY THIS METHOD USING ORIGINAL RELATION MODEL GW-6972
  async syncRelation(relationMock:RelationMock, baseDate:Date):Promise<RelationMock|null> {
    if (relationMock == null) return null;

    const distanceMillisecondsToExpiredAt = relationMock.getDistanceInMillisecondsToExpiredAt(baseDate);

    if (distanceMillisecondsToExpiredAt < 0) {
      try {
        return await this.syncSupportedGrowiCommands(relationMock);
      }
      catch (err) {
        logger.error(err);
        return null;
      }
    }

    // 24 hours
    if (distanceMillisecondsToExpiredAt < 24 * 60 * 60 * 1000) {
      try {
        this.syncSupportedGrowiCommands(relationMock);
      }
      catch (err) {
        logger.error(err);
      }
    }

    return relationMock;
  }

  async isSupportedGrowiCommandForSingleUse(relationMock:RelationMock, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relationMock, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
    // return relationMock.supportedCommandsForSingleUse.includes(growiCommandType);
    return false;
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
  }

  async isSupportedGrowiCommandForBroadcastUse(relationMock:RelationMock, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relationMock, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
    // return relationMock.supportedCommandsForBroadcastUse.includes(growiCommandType);
    return true;
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
  }

}
