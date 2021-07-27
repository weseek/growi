import { Service } from '@tsed/di';
import { Relation } from '~/entities/relation';

@Service()
export class RelationsService {

  isSupportedGrowiCommandForSingleUse(relation:Relation, growiCommandType:string):boolean {
    return !relation.isExpiredCommands() && relation.supportedCommandsForSingleUse.includes(growiCommandType);
  }

  isSupportedGrowiCommandForBroadcastUse(relation:Relation, growiCommandType:string):boolean {
    return !relation.isExpiredCommands() && relation.supportedCommandsForBroadcastUse.includes(growiCommandType);
  }

}
