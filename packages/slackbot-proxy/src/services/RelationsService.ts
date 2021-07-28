import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

import { Relation } from '~/entities/relation';
import { RelationRepository } from '~/repositories/relation';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:RelationsService');

@Service()
export class RelationsService {

  @Inject()
  relationRepository: RelationRepository;

  async getSupportedGrowiCommands(relation:Relation):Promise<any> {
    // generate API URL
    const url = new URL('/_api/v3/slack-integration/supported-commands', relation.growiUri);
    return axios.get(url.toString(), {
      headers: {
        'x-growi-ptog-tokens': relation.tokenPtoG,
      },
    });
  }

  async syncSupportedGrowiCommands(relation:Relation): Promise<Relation> {
    const res = await this.getSupportedGrowiCommands(relation);
    const { supportedCommandsForBroadcastUse, supportedCommandsForSingleUse } = res.data;
    relation.supportedCommandsForBroadcastUse = supportedCommandsForBroadcastUse;
    relation.supportedCommandsForSingleUse = supportedCommandsForSingleUse;
    relation.expiredAtCommands = addHours(new Date(), 48);

    return this.relationRepository.save(relation);
  }

  async syncAndReturnBool(relation:Relation, baseDate:Date, discriminantWhetherRelationIsSupported:(relation:Relation)=>boolean):Promise<boolean> {
    const distanceHoursToExpiredAt = relation.getDistanceInMillisecondsToExpiredAt(baseDate);

    if (distanceHoursToExpiredAt < 0) {
      try {
        const syncedRelation = await this.syncSupportedGrowiCommands(relation);
        return discriminantWhetherRelationIsSupported(syncedRelation);
      }
      catch (err) {
        logger.error(err);
        return false;
      }
    }

    // 24 hours
    if (distanceHoursToExpiredAt < 1000 * 60 * 60 * 24) {
      try {
        this.syncSupportedGrowiCommands(relation);
      }
      catch (err) {
        logger.error(err);
      }
    }

    return discriminantWhetherRelationIsSupported(relation);
  }

  async isSupportedGrowiCommandForSingleUse(relation:Relation, growiCommandType:string, baseDate:Date):Promise<boolean> {
    return this.syncAndReturnBool(relation, baseDate, relation => relation.supportedCommandsForSingleUse.includes(growiCommandType));
  }

  async isSupportedGrowiCommandForBroadcastUse(relation:Relation, growiCommandType:string, baseDate:Date):Promise<boolean> {
    return this.syncAndReturnBool(relation, baseDate, relation => relation.supportedCommandsForBroadcastUse.includes(growiCommandType));
  }

}
