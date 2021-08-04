import { Req } from '@tsed/common';
import { RequestFromGrowi } from '@growi/slack';

export type GrowiReq = Req & RequestFromGrowi;
