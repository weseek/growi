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

  async getSupportedGrowiCommands(relation:RelationMock):Promise<any> {
    // generate API URL
    const url = new URL('/_api/v3/slack-integration/supported-commands', relation.growiUri);
    return axios.get(url.toString(), {
      headers: {
        'x-growi-ptog-tokens': relation.tokenPtoG,
      },
    });
  }

  async syncSupportedGrowiCommands(relation:RelationMock): Promise<RelationMock> {
    const res = await this.getSupportedGrowiCommands(relation);

    // MOCK DATA MODIFY THIS GW-6972 ---------------
    /**
     * this code represents the update of cache (Relation schema) using request from GROWI
     */
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = res.data.data;
    if (relation !== null) {
      relation.permissionsForBroadcastUseCommands = permissionsForBroadcastUseCommands;
      relation.permissionsForSingleUseCommands = permissionsForSingleUseCommands;
      relation.expiredAtCommands = addHours(new Date(), 48);
      return this.relationMockRepository.save(relation);
    }
    throw Error('No relation exists.');
    // MOCK DATA MODIFY THIS GW-6972 ---------------
  }

  // MODIFY THIS METHOD USING ORIGINAL RELATION MODEL GW-6972
  async syncRelation(relation:RelationMock, baseDate:Date):Promise<RelationMock|null> {
    if (relation == null) return null;

    const distanceMillisecondsToExpiredAt = relation.getDistanceInMillisecondsToExpiredAt(baseDate);

    if (distanceMillisecondsToExpiredAt < 0) {
      try {
        return await this.syncSupportedGrowiCommands(relation);
      }
      catch (err) {
        logger.error(err);
        return null;
      }
    }

    // 24 hours
    if (distanceMillisecondsToExpiredAt < 24 * 60 * 60 * 1000) {
      try {
        this.syncSupportedGrowiCommands(relation);
      }
      catch (err) {
        logger.error(err);
      }
    }

    return relation;
  }

  async isSupportedGrowiCommandForSingleUse(relation:RelationMock, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
    // return relationMock.supportedCommandsForSingleUse.includes(growiCommandType);
    return false;
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
  }

  async isSupportedGrowiCommandForBroadcastUse(relation:RelationMock, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
    // return relationMock.supportedCommandsForBroadcastUse.includes(growiCommandType);
    return true;
    // MOCK DATA THIS CODE SHOULD BE IMPLEMENTED IN GW-7017
  }

}
