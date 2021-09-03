import { Inject, Service } from '@tsed/di';

import axios from 'axios';
import { addHours } from 'date-fns';

// import { Relation } from '~/entities/relation';
import { REQUEST_TIMEOUT_FOR_PTOG } from '@growi/slack';
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
      timeout: REQUEST_TIMEOUT_FOR_PTOG,
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


  allowedRelations:RelationMock[] = [];

  getAllowedRelations():RelationMock[] {
    return this.allowedRelations;
  }

  disallowedGrowiUrls: Set<string> = new Set();

  getDisallowedGrowiUrls():Set<string> {
    return this.disallowedGrowiUrls;
  }

  commandName:string;

  getCommandName():string {
    return this.commandName;
  }


  async checkPermissionForInteractions(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      relation:RelationMock, channelName:string, callbackId:string, actionId:string,
  ):Promise<void> {

    const singleUse = Object.keys(relation.permissionsForSingleUseCommands);
    const broadCastUse = Object.keys(relation.permissionsForBroadcastUseCommands);
    let permissionForInteractions:boolean|string[];
    let isPermittedForInteractions!:boolean;

    [...singleUse, ...broadCastUse].forEach(async(tempCommandName) => {

      // ex. search OR search:handlerName
      const commandRegExp = new RegExp(`(^${tempCommandName}$)|(^${tempCommandName}:\\w+)`);

      // skip this forEach loop if the requested command is not in permissionsForBroadcastUseCommands and permissionsForSingleUseCommands
      if (!commandRegExp.test(actionId) && !commandRegExp.test(callbackId)) {
        return;
      }

      this.commandName = tempCommandName;

      // case: singleUse
      permissionForInteractions = relation.permissionsForSingleUseCommands[tempCommandName];

      // case: broadcastUse
      if (permissionForInteractions == null) {
        permissionForInteractions = relation.permissionsForBroadcastUseCommands[tempCommandName];
      }

      isPermittedForInteractions = false;
      if (permissionForInteractions === true) {
        isPermittedForInteractions = true;
        return;
      }

      // check permission at channel level
      if (Array.isArray(permissionForInteractions) && permissionForInteractions.includes(channelName)) {
        isPermittedForInteractions = true;
        return;
      }
    });

    if (!isPermittedForInteractions) {
      this.disallowedGrowiUrls.add(relation.growiUri);
    }

    this.allowedRelations.push(relation);
  }

}
