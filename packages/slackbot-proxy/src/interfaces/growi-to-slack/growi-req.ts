import { RequestFromGrowi } from '@growi/slack';
import { Req } from '@tsed/common';

export type GrowiReq = Req & RequestFromGrowi;
