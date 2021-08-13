import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

import { Relation } from '~/entities/relation';
import { RelationRepository } from '~/repositories/relation';

import { RelationMock } from '~/entities/relation-mock';
import { RelationMockRepository } from '~/repositories/relation-mock';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:RelationsService');

@Service()
export class RelationsService {

  @Inject()
  relationRepository: RelationRepository;

  @Inject()
  relationMockRepository: RelationMockRepository;

  // DELETE THIS METHOD GW-6972
  async getMockFromRelation(relation: Relation): Promise<RelationMock|null> {
    const tokenGtoP = relation.tokenGtoP;
    const relationMock = await this.relationMockRepository.findOne({ where: [{ tokenGtoP }] });

    return relationMock || null;
  }

  async getSupportedGrowiCommands(relation:Relation):Promise<any> {
    // generate API URL
    const url = new URL('/_api/v3/slack-integration/supported-commands', relation.growiUri);
    return axios.get(url.toString(), {
      headers: {
        'x-growi-ptog-tokens': relation.tokenPtoG,
      },
    });
  }

  async syncSupportedGrowiCommands(relation:Relation): Promise<RelationMock> {
    const res = await this.getSupportedGrowiCommands(relation);
    // const { supportedCommandsForBroadcastUse, supportedCommandsForSingleUse } = res.data;
    // relation.supportedCommandsForBroadcastUse = supportedCommandsForBroadcastUse;
    // relation.supportedCommandsForSingleUse = supportedCommandsForSingleUse;
    // relation.expiredAtCommands = addHours(new Date(), 48);

    // return this.relationRepository.save(relation);

    // MOCK DATA MODIFY THIS GW-6972 ---------------
    /**
     * this code represents the update of cache (Relation schema) using request from GROWI
     */
    const relationMock = await this.getMockFromRelation(relation);
    const { supportedCommandsForBroadcastUse, supportedCommandsForSingleUse, permittedChannelsForEachCommand } = res.data;
    if (relationMock !== null) {
      relationMock.supportedCommandsForBroadcastUse = supportedCommandsForBroadcastUse;
      relationMock.supportedCommandsForSingleUse = supportedCommandsForSingleUse;
      relationMock.permittedChannelsForEachCommand = permittedChannelsForEachCommand;
      relationMock.expiredAtCommands = addHours(new Date(), 48);

      // MODIFY THIS ORIGINAL OPERATION GW-6972
      relation.supportedCommandsForBroadcastUse = supportedCommandsForBroadcastUse;
      relation.supportedCommandsForSingleUse = supportedCommandsForSingleUse;
      relation.expiredAtCommands = addHours(new Date(), 48);
      this.relationRepository.save(relation);

      return this.relationMockRepository.save(relationMock);
    }
    throw Error('No relation mock is null.');
    // MOCK DATA MODIFY THIS GW-6972 ---------------
  }

  // MODIFY THIS METHOD USING ORIGINAL RELATION MODEL GW-6972
  async syncRelation(relation:Relation, baseDate:Date):Promise<RelationMock|null> {
    const relationMock = await this.getMockFromRelation(relation);
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
    if (distanceMillisecondsToExpiredAt < 1000 * 60 * 60 * 24) {
      try {
        this.syncSupportedGrowiCommands(relationMock);
      }
      catch (err) {
        logger.error(err);
      }
    }

    return relationMock;
  }

  async isSupportedGrowiCommandForSingleUse(relation:Relation, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    return relation.supportedCommandsForSingleUse.includes(growiCommandType);
  }

  async isSupportedGrowiCommandForBroadcastUse(relation:Relation, growiCommandType:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }
    return relation.supportedCommandsForBroadcastUse.includes(growiCommandType);
  }

}
