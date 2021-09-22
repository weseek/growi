import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackBotService:togetter');
const {
  inputBlock, actionsBlock, buttonElement, markdownSectionBlock, divider, respond,
} = require('@growi/slack');
const { parse, format } = require('date-fns');
const axios = require('axios');
const SlackbotError = require('../../models/vo/slackbot-error');

module.exports = (crowi) => {
  const CreatePageService = require('./create-page-service');
  const createPageService = new CreatePageService(crowi);
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = async function(growiCommand, client, body) {
    await respond(growiCommand.responseUrl, {
      text: 'Select messages to use.',
      blocks: this.togetterMessageBlocks(),
    });
    return;
  };

  handler.handleInteractions = async function(client, payload, handlerMethodName) {
    await this[handlerMethodName](client, payload);
  };

  handler.cancel = async function(client, payload) {
    const responseUrl = payload.response_url;
    await axios.post(responseUrl, {
      delete_original: true,
    });
  };

  handler.createPage = async function(client, payload) {
    let result = [];
    const channel = payload.channel.id;
    try {
      // validate form
      const { path, oldest, newest } = await this.togetterValidateForm(client, payload);
      // get messages
      result = await this.togetterGetMessages(client, payload, channel, path, newest, oldest);
      // clean messages
      const cleanedContents = await this.togetterCleanMessages(result.messages);

      const contentsBody = cleanedContents.join('');
      // create and send url message
      await this.togetterCreatePageAndSendPreview(client, payload, path, channel, contentsBody);
    }
    catch (err) {
      logger.error('Error occured by togetter.');
      throw err;
    }
  };

  handler.togetterValidateForm = async function(client, payload) {
    const grwTzoffset = crowi.appService.getTzoffset() * 60;
    const path = payload.state.values.page_path.page_path.value;
    let oldest = payload.state.values.oldest.oldest.value;
    let newest = payload.state.values.newest.newest.value;
    oldest = oldest.trim();
    newest = newest.trim();
    if (!path) {
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'Page path is required.',
        mainMessage: 'Page path is required.',
      });
    }
    /**
     * RegExp for datetime yyyy/MM/dd-HH:mm
     * @see https://regex101.com/r/XbxdNo/1
     */
    const regexpDatetime = new RegExp(/^[12]\d\d\d\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])-([01][0-9]|2[0123]):[0-5][0-9]$/);

    if (!regexpDatetime.test(oldest)) {
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'Datetime format for oldest must be yyyy/MM/dd-HH:mm',
        mainMessage: 'Datetime format for oldest must be yyyy/MM/dd-HH:mm',
      });
    }
    if (!regexpDatetime.test(newest)) {
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'Datetime format for newest must be yyyy/MM/dd-HH:mm',
        mainMessage: 'Datetime format for newest must be yyyy/MM/dd-HH:mm',
      });
    }
    oldest = parse(oldest, 'yyyy/MM/dd-HH:mm', new Date()).getTime() / 1000 + grwTzoffset;
    // + 60s in order to include messages between hh:mm.00s and hh:mm.59s
    newest = parse(newest, 'yyyy/MM/dd-HH:mm', new Date()).getTime() / 1000 + grwTzoffset + 60;

    if (oldest > newest) {
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'Oldest datetime must be older than the newest date time.',
        mainMessage: 'Oldest datetime must be older than the newest date time.',
      });
    }

    return { path, oldest, newest };
  };

  handler.togetterGetMessages = async function(client, payload, channel, path, newest, oldest) {
    const result = await client.conversations.history({
      channel,
      newest,
      oldest,
      limit: 100,
      inclusive: true,
    });

    // return if no message found
    if (!result.messages.length) {
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'No message found from togetter command. Try different datetime.',
        mainMessage: 'No message found from togetter command. Try different datetime.',
      });
    }
    return result;
  };

  handler.togetterCleanMessages = async function(messages) {
    const cleanedContents = [];
    let lastMessage = {};
    const grwTzoffset = crowi.appService.getTzoffset() * 60;
    messages
      .sort((a, b) => {
        return a.ts - b.ts;
      })
      .forEach((message) => {
        // increment contentsBody while removing the same headers
        // exclude header
        const lastMessageTs = Math.floor(lastMessage.ts / 60);
        const messageTs = Math.floor(message.ts / 60);
        if (lastMessage.user === message.user && lastMessageTs === messageTs) {
          cleanedContents.push(`${message.text}\n`);
        }
        // include header
        else {
          const ts = (parseInt(message.ts) - grwTzoffset) * 1000;
          const time = format(new Date(ts), 'h:mm a');
          cleanedContents.push(`${message.user}  ${time}\n${message.text}\n`);
          lastMessage = message;
        }
      });
    return cleanedContents;
  };

  handler.togetterCreatePageAndSendPreview = async function(client, payload, path, channel, contentsBody) {
    try {
      await createPageService.createPageInGrowi(client, payload, path, channel, contentsBody);
      // send preview to dm
      await client.chat.postMessage({
        channel: payload.user.id,
        text: 'Preview from togetter command',
        blocks: [
          markdownSectionBlock('*Preview*'),
          divider(),
          markdownSectionBlock(contentsBody),
          divider(),
        ],
      });
      // dismiss message
      const responseUrl = payload.response_url;
      axios.post(responseUrl, {
        delete_original: true,
      });
    }
    catch (err) {
      logger.error('Error occurred while creating a page.', err);
      throw new SlackbotError({
        method: 'postMessage',
        to: 'dm',
        popupMessage: 'Error occurred while creating a page.',
        mainMessage: 'Error occurred while creating a page.',
      });
    }
  };

  handler.togetterMessageBlocks = function() {
    return [
      markdownSectionBlock('Select the oldest and newest datetime of the messages to use.'),
      inputBlock(this.plainTextInputElementWithInitialTime('oldest'), 'oldest', 'Oldest datetime'),
      inputBlock(this.plainTextInputElementWithInitialTime('newest'), 'newest', 'Newest datetime'),
      inputBlock(this.togetterInputBlockElement('page_path', '/'), 'page_path', 'Page path'),
      actionsBlock(
        buttonElement({ text: 'Cancel', actionId: 'togetter:cancel' }),
        buttonElement({ text: 'Create page', actionId: 'togetter:createPage', style: 'primary' }),
      ),
    ];
  };

  /**
   * Plain-text input element
   * https://api.slack.com/reference/block-kit/block-elements#input
   */
  handler.togetterInputBlockElement = function(actionId, placeholderText = 'Write something ...') {
    return {
      type: 'plain_text_input',
      placeholder: {
        type: 'plain_text',
        text: placeholderText,
      },
      action_id: actionId,
    };
  };

  handler.plainTextInputElementWithInitialTime = function(actionId) {
    const tzDateSec = new Date().getTime();
    const grwTzoffset = crowi.appService.getTzoffset() * 60 * 1000;
    const initialDateTime = format(new Date(tzDateSec - grwTzoffset), 'yyyy/MM/dd-HH:mm');
    return {
      type: 'plain_text_input',
      action_id: actionId,
      initial_value: initialDateTime,
    };
  };

  return handler;
};
