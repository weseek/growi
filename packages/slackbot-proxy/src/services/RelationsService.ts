import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

// import { Relation } from '~/entities/relation';
import { markdownSectionBlock, generateWebClient } from '@growi/slack';
import { ChatPostEphemeralResponse } from '@slack/web-api';
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

    const commandRegExp = new RegExp(`(^${growiCommandType}$)|(^${growiCommandType}:\\w+)`);

    // skip this forEach loop if the requested command is not in permissionsForBroadcastUseCommands
    if (!commandRegExp.test(growiCommandType)) {
      return false;
    }

    const permission = relation.supportedCommandsForSingleUse[growiCommandType];

    if (permission == null) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.includes(channelName);
    }

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
      return false;
    }

    const permission = relation.supportedCommandsForBroadcastUse[growiCommandType];

    if (permission == null) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.includes(channelName);
    }

    return permission;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  postNotPermissionMessage(relations:RelationMock[], commandName:string, body:any):Promise<ChatPostEphemeralResponse> {
    const botToken = relations[0].installation?.data.bot?.token;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const client = generateWebClient(botToken!);

    return client.chat.postEphemeral({
      text: 'Error occured.',
      channel: body.channel_id,
      user: body.user_id,
      blocks: [
        markdownSectionBlock(`It is not allowed to run *'${commandName}'* command to this GROWI.`),
      ],
    });
  }

  isPermitted = false;

  permission:boolean|string[];

  async checkPermissionForInteractions(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      relation:RelationMock, channelName:string, callbackId:string, actionId:string, body:any, relations:RelationMock[],
  ):Promise<void> {

    const baseDate = new Date();
    const syncedRelation = await this.syncRelation(relation, baseDate);

    if (syncedRelation == null) {
      this.isPermitted = false;
      return;
    }
    const singleUse = Object.keys(relation.supportedCommandsForSingleUse);
    const broadCastUse = Object.keys(relation.supportedCommandsForBroadcastUse);

    [...singleUse, ...broadCastUse].forEach(async(commandName) => {
      this.permission = relation.supportedCommandsForSingleUse[commandName];

      if (this.permission == null) {
        this.permission = relation.supportedCommandsForBroadcastUse[commandName];
      }

      // permission check
      if (this.permission === true) {
        this.isPermitted = true;
        return;
      }

      if (Array.isArray(this.permission)) {
        this.isPermitted = this.permission.includes(channelName);
        return;
      }

      // ex. search OR search:handlerName
      const commandRegExp = new RegExp(`(^${commandName}$)|(^${commandName}:\\w+)`);

      // skip this forEach loop if the requested command is not in permissionsForBroadcastUseCommands and permissionsForSingleUseCommandskey
      if (!commandRegExp.test(actionId) && !commandRegExp.test(callbackId)) {
        return;
      }

      if (!this.isPermitted) {
        this.postNotPermissionMessage(relations, commandName, body);
      }
    });
  }

}
