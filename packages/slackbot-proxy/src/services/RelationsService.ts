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
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = res.data;
    relation.permissionsForBroadcastUseCommands = permissionsForBroadcastUseCommands;
    relation.permissionsForSingleUseCommands = permissionsForSingleUseCommands;
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

  async isPermissionsForSingleUseCommands(relation:RelationMock, growiCommandType:string, channelName:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }

    const permission = relation.permissionsForSingleUseCommands[growiCommandType];

    if (permission == null) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.includes(channelName);
    }

    return permission;
  }

  async isPermissionsUseBroadcastCommands(relation:RelationMock, growiCommandType:string, channelName:string, baseDate:Date):Promise<boolean> {
    const syncedRelation = await this.syncRelation(relation, baseDate);
    if (syncedRelation == null) {
      return false;
    }

    const permission = relation.permissionsForBroadcastUseCommands[growiCommandType];

    if (permission == null) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.includes(channelName);
    }

    return permission;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  postNotAllowedMessage(relations:RelationMock[], commandName:string, body:any):Promise<ChatPostEphemeralResponse> {
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


  async checkPermissionForInteractions(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      relation:RelationMock, channelName:string, callbackId:string, actionId:string, body:any, relations:RelationMock[],
  ):Promise<void> {

    const baseDate = new Date();
    const syncedRelation = await this.syncRelation(relation, baseDate);
    let isPermittedForInteractions = false;

    if (syncedRelation == null) {
      isPermittedForInteractions = false;
      return;
    }

    const singleUse = Object.keys(relation.permissionsForSingleUseCommands);
    const broadCastUse = Object.keys(relation.permissionsForBroadcastUseCommands);
    let permissionForInteractions:boolean|string[];

    [...singleUse, ...broadCastUse].forEach(async(commandName) => {

      // case: singleUse
      permissionForInteractions = relation.permissionsForSingleUseCommands[commandName];

      // case: broadcastUse
      if (permissionForInteractions == null) {
        permissionForInteractions = relation.permissionsForBroadcastUseCommands[commandName];
      }

      if (permissionForInteractions === true) {
        isPermittedForInteractions = true;
        return;
      }

      // check permission at channel level
      if (Array.isArray(permissionForInteractions)) {
        isPermittedForInteractions = permissionForInteractions.includes(channelName);
        return;
      }

      // ex. search OR search:handlerName
      const commandRegExp = new RegExp(`(^${commandName}$)|(^${commandName}:\\w+)`);

      // skip this forEach loop if the requested command is not in permissionsForBroadcastUseCommands and permissionsForSingleUseCommands
      if (!commandRegExp.test(actionId) && !commandRegExp.test(callbackId)) {
        return;
      }

      if (!isPermittedForInteractions) {
        this.postNotAllowedMessage(relations, commandName, body);
      }
    });
  }

}
