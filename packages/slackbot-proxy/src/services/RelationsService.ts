import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

// import { Relation } from '~/entities/relation';
import { RelationMock } from '~/entities/relation-mock';
import { RelationRepository } from '~/repositories/relation';
import { RelationMockRepository } from '~/repositories/relation-mock';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:RelationsService');

@Service()
export class RelationsService {

  @Inject()
  relationRepository: RelationRepository;

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
    const { supportedCommandsForBroadcastUse, supportedCommandsForSingleUse } = res.data;
    relation.supportedCommandsForBroadcastUse = supportedCommandsForBroadcastUse;
    relation.supportedCommandsForSingleUse = supportedCommandsForSingleUse;
    relation.expiredAtCommands = addHours(new Date(), 48);

    return this.relationRepository.save(relation);
  }

  async syncRelation(relation:RelationMock, baseDate:Date):Promise<RelationMock|null> {
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
    if (distanceMillisecondsToExpiredAt < 1000 * 60 * 60 * 24) {
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
    return relation.supportedCommandsForSingleUse.includes(growiCommandType);
  }

  async isSupportedGrowiCommandForBroadcastUse(relation:RelationMock, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    return relation.supportedCommandsForBroadcastUse.includes(growiCommandType);
  }

}
