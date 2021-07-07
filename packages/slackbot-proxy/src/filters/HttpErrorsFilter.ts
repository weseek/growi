import {
  Catch, ExceptionFilterMethods, PlatformContext, PlatformResponse,
} from '@tsed/common';
import { CustomHttpError } from '@growi/slack';

@Catch(CustomHttpError)
export class HttpErrorsFilter implements ExceptionFilterMethods {

  catch(exception: CustomHttpError, ctx: PlatformContext): PlatformResponse<any> {
    // status が欲しい
    console.log('CATCHEDDDDD!!!!!!');
    const { response } = ctx;

    console.log('$$$EXC$$$');
    console.log(exception.message);

    return response.status(418).body(exception.message);
  }

}
