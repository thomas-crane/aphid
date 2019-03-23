import { Client, ClientOptions, Message } from 'discord.js';
import * as commands from '../commands';
import log from '../log';
import { Type } from '../models/type';
import * as modules from '../modules';
import { AphidClientOptions } from './aphid-client-options';

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
    const cmd = message.content.split(' ')[0].slice(this.aphidOptions.prefix.length);

    // check if there are any triggers for this command.
    if (!commands.loader.hasTrigger(cmd)) {
      return;
    }

    const command = commands.loader.getCommand(cmd);
    const moduleInstance = modules.loader.getInstance(command.moduleName);
    moduleInstance[command.methodKey].call(moduleInstance, this, message);
  }
}
