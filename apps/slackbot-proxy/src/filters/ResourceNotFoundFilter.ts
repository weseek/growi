import type { ExceptionFilterMethods, PlatformContext, PlatformResponse } from '@tsed/common';
import {
  Catch, ResourceNotFound,
} from '@tsed/common';

@Catch(ResourceNotFound)
export class ResourceNotFoundFilter implements ExceptionFilterMethods {

  async catch(exception: ResourceNotFound, ctx: PlatformContext): Promise<PlatformResponse<any>> {
    const { response } = ctx;

    const obj = {
      status: exception.status,
      message: exception.message,
      url: exception.url,
    };

    return response
      .status(exception.status)
      .body(obj);
  }

}
