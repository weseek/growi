import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

// import { Relation } from '~/entities/relation';
import { RelationMock } from '~/entities/relation-mock';
// import { RelationRepository } from '~/repositories/relation';
import { RelationMockRepository } from '~/repositories/relation-mock';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:RelationsService');

@Service()
export class RelationsService {

  @Inject()
  // relationRepository: RelationRepository;

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

    return this.relationMockRepository.save(relation);
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

  async isSupportedGrowiCommandForSingleUse(relation:RelationMock, growiCommandType:string, channelName:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);

    if (syncedRelation == null) {
      return false;
    }
    console.log(growiCommandType, 74);

    const commandRegExp = new RegExp(`(^${growiCommandType}$)|(^${growiCommandType}:\\w+)`);

    // skip this forEach loop if the requested command is not in permissionsForBroadcastUseCommands
    if (!commandRegExp.test(growiCommandType)) {
      console.log(209);
      return false;
    }
    console.log(relation.supportedCommandsForSingleUse, 83);
    console.log(relation.supportedCommandsForSingleUse[growiCommandType], 84);

    const permission = relation.supportedCommandsForSingleUse[growiCommandType];
    console.log(permission, 76);

    if (permission == null) {
      console.log(88);

      return false;
    }
    console.log(81, channelName);

    if (Array.isArray(permission)) {

      return permission.includes(channelName);
    }
    console.log(84);

    return permission;
  }

  async isSupportedGrowiCommandForBroadcastUse(relation:RelationMock, growiCommandType:string, channelName:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }

    const commandRegExp = new RegExp(`(^${growiCommandType}$)|(^${growiCommandType}:\\w+)`);

    // skip this forEach loop if the requested command is not in permissionsForSingleUseCommandskey
    if (!commandRegExp.test(growiCommandType)) {
      console.log(183);

      return false;
    }
    console.log(119);

    const permission = relation.supportedCommandsForBroadcastUse[growiCommandType];
    console.log(permission);


    if (permission == null) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.includes(channelName);
    }

    return permission;
  }

}
