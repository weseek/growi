import { RespondBodyForResponseUrl, markdownSectionBlock } from '@growi/slack';

const generateDefaultRespondBody = (message: string): RespondBodyForResponseUrl => {
  return {
    text: message,
    blocks: [
      markdownSectionBlock(`*An error occured*\n \`${message}\``),
    ],
  };
};

type SlackbotErrorOpts = {
  responseUrl?: string,
  respondBody?: RespondBodyForResponseUrl,
}

/**
 * Error class for slackbot service
 */
export class SlackbotError extends Error {

  responseUrl?: string;

  respondBody: RespondBodyForResponseUrl;

  constructor(
      message: string,
      opts: SlackbotErrorOpts = {},
  ) {
    super(message);
    this.responseUrl = opts.responseUrl;
    this.respondBody = opts.respondBody || generateDefaultRespondBody(message);
  }

}
