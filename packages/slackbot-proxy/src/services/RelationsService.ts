import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { addHours } from 'date-fns';

import { Relation } from '~/entities/relation';
import { RelationRepository } from '~/repositories/relation';

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

  async syncSupportedGrowiCommands(relations:Relation[]): Promise<Relation[]> {
    const result = await Promise.all(relations.map(async(relation) => {
      if (!relation.isExpiredCommands()) {
        return relation;
      }

      const res = await this.getSupportedGrowiCommands(relation);
      const { supportedCommandsForBroadcastUse, supportedCommandsForSingleUse } = res.data;
      relation.supportedCommandsForBroadcastUse = supportedCommandsForBroadcastUse;
      relation.supportedCommandsForSingleUse = supportedCommandsForSingleUse;
      relation.expiredAtCommands = addHours(new Date(), 48);

      return this.relationRepository.save(relation);
    }));

    return result;
  }

  isSupportedGrowiCommandForSingleUse(relation:Relation, growiCommandType:string, baseDate:Date):boolean {
    const distanceHoursToExpiredAt = relation.getDistanceInMillisecondsToExpiredAt(baseDate);

    if (distanceHoursToExpiredAt < 0) {
      console.log('sync');
    }

    // 24 hours
    if (distanceHoursToExpiredAt < 1000 * 60 * 60 * 24) {
      console.log('update');
    }

    return relation.supportedCommandsForSingleUse.includes(growiCommandType);
  }

  // isSupportedGrowiCommandForBroadcastUse(relation:Relation, growiCommandType:string):boolean {
  //   return relation.supportedCommandsForBroadcastUse.includes(growiCommandType);
  // }

}
