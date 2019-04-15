import { Client, ClientOptions, Message } from 'discord.js';
import * as commands from '../commands';
import log from '../log';
import { Type } from '../models/type';
import * as modules from '../modules';
import { AphidClientOptions } from './aphid-client-options';
import { ParameterKind } from '../messages/parameter-kind';
import { MessageArgs } from '../messages/message-args';

/**
 * A discord bot client.
 */
export class AphidClient extends Client {

  constructor(private aphidOptions: AphidClientOptions, clientOptions?: ClientOptions) {
    super(clientOptions);
    this.on('message', this.handleMessage.bind(this));
  }

  /**
   * Loads the module provided.
   * @param module The module to load.
   */
  loadModule(module: Type<any>): void {
    log.info('AphidClient', `Loading ${module.name}`);
    const info = modules.loader.getInfo(module.name);
    if (info) {
      log.success('AphidClient', `Loaded module: ${info.name}!`);
    } else {
      log.error('AphidClient', `Failed to load module ${module.name}`);
    }
  }

  /**
   * Handles a message and invokes the relevant command if there is one.
   * @param message The message to handle.
   */
  private handleMessage(message: Message) {
    // make sure it's not a bot message.
    if (message.author.bot) {
      return;
    }
    // make sure the message starts with the prefix.
    if (message.content.slice(0, this.aphidOptions.prefix.length) !== this.aphidOptions.prefix) {
      return;
    }
    // get the command part.
    const messageParts = message.content.split(' ');
    const cmd = messageParts[0].slice(this.aphidOptions.prefix.length);
    const argParts = messageParts.slice(1);

    // check if there are any triggers for this command.
    if (!commands.loader.hasTrigger(cmd)) {
      return;
    }

    const [command, commandParams] = commands.loader.getCommand(cmd);
    const moduleInstance = modules.loader.getInstance(command.moduleName);

    const messageArgs: MessageArgs = {
      rest: argParts.slice(commandParams.length),
    };
    const errors: any[] = [];
    // parse arguments.
    for (let i = 0; i < commandParams.length; i++) {
      const param = commandParams[i];
      const arg = argParts[i];
      // does argParts contain an entry?
      if (param.info.required === true) {
        if (arg === undefined) {
          // required arg not provided.
          // report error
          break;
        }
      }

      // we have an argument, check that it matches the type of the parameter.
      if (arg !== undefined) {
        if (param.info.kind === ParameterKind.Number) {
          if (isNaN(arg as any)) {
            // report error
            continue;
          } else {
            const numValue = +arg;

            // do range checking.

            messageArgs[param.info.name] = numValue;
          }
        }
      }
    }

    if (errors.length > 0) {
      // invoke error handler
    } else {
      moduleInstance[command.methodKey].call(moduleInstance, this, message, messageArgs);
    }

  }
}
