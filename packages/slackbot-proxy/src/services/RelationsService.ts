import { Inject, Service } from '@tsed/di';

import axios from 'axios';
import { addHours } from 'date-fns';

import { REQUEST_TIMEOUT_FOR_PTOG } from '@growi/slack';
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
      timeout: REQUEST_TIMEOUT_FOR_PTOG,
    });
  }

  async syncSupportedGrowiCommands(relation:Relation): Promise<Relation> {
    const res = await this.getSupportedGrowiCommands(relation);
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = res.data.data;
    if (relation !== null) {
      relation.permissionsForBroadcastUseCommands = permissionsForBroadcastUseCommands;
      relation.permissionsForSingleUseCommands = permissionsForSingleUseCommands;
      relation.expiredAtCommands = addHours(new Date(), 48);
      return this.relationRepository.save(relation);
    }
    throw Error('No relation exists.');
  }

  async syncRelation(relation:Relation, baseDate:Date):Promise<Relation|null> {
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

  async isPermissionsForSingleUseCommands(relation:Relation, growiCommandType:string, channelName:string, baseDate:Date):Promise<boolean> {
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

  async isPermissionsUseBroadcastCommands(relation:Relation, growiCommandType:string, channelName:string, baseDate:Date):Promise<boolean> {
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

  allowedRelations:Relation[];

  disallowedGrowiUrls: Set<string>;

  notAllowedCommandName:string

  getAllowedRelations():Relation[] {
    return this.allowedRelations;
  }

  getDisallowedGrowiUrls():Set<string> {
    return this.disallowedGrowiUrls;
  }

  getNotAllowedCommandName():string {
    return this.notAllowedCommandName;
  }

  async checkPermissionForInteractions(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      relation:Relation, channelName:string, callbackId:string, actionId:string,
  ):Promise<void> {

    // initialize params
    this.allowedRelations = [];
    this.disallowedGrowiUrls = new Set();
    this.notAllowedCommandName = '';

    let permissionForInteractions:boolean|string[];
    const singleUse = Object.keys(relation.permissionsForSingleUseCommands);
    const broadCastUse = Object.keys(relation.permissionsForBroadcastUseCommands);

    [...singleUse, ...broadCastUse].forEach(async(tempCommandName) => {

      // ex. search OR search:handlerName
      const commandRegExp = new RegExp(`(^${tempCommandName}$)|(^${tempCommandName}:\\w+)`);
      // skip this forEach loop if the requested command is not in permissionsForBroadcastUseCommands and permissionsForSingleUseCommands
      if (!commandRegExp.test(actionId) && !commandRegExp.test(callbackId)) {
        return;
      }

      // case: singleUse
      permissionForInteractions = relation.permissionsForSingleUseCommands[tempCommandName];
      // case: broadcastUse
      if (permissionForInteractions == null) {
        permissionForInteractions = relation.permissionsForBroadcastUseCommands[tempCommandName];
      }

      if (permissionForInteractions === true) {
        return this.allowedRelations.push(relation);
      }

      // check permission at channel level
      if (Array.isArray(permissionForInteractions) && permissionForInteractions.includes(channelName)) {
        return this.allowedRelations.push(relation);
      }

      this.disallowedGrowiUrls.add(relation.growiUri);
      this.notAllowedCommandName = tempCommandName;
    });
  }

}
