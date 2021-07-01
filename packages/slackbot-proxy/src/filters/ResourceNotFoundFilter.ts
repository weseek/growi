import {Catch, ExceptionFilterMethods, PlatformContext, ResourceNotFound} from "@tsed/common";

@Catch(ResourceNotFound)
export class ResourceNotFoundFilter implements ExceptionFilterMethods {
  async catch(exception: ResourceNotFound, ctx: PlatformContext) {
    const {response} = ctx;

    const obj = {
      status: exception.status,
      message: exception.message,
      url: exception.url
    };

    return response
      .status(exception.status)
      .body(obj);
  }
}
