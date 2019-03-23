import { Message } from 'discord.js';
import { AphidClient } from '../core';
import log from '../log';
import * as modules from '../modules';
import { LoadedCommand } from './loaded-command';

/**
 * A manager class for loading and storing commands.
 */
export class CommandLoader {
  private triggerMap: Map<string, LoadedCommand>;
  private moduleMap: Map<string, LoadedCommand[]>;

  constructor() {
    this.triggerMap = new Map();
    this.moduleMap = new Map();
  }

  /**
   * Loads and stores the command.
   * @param command The command to add.
   */
  addCommand(command: LoadedCommand) {
    if (typeof command !== 'object') {
      throw new Error(`Parameter "command" should be LoadedCommand, not ${typeof command}`);
    }

    // for each of the commands triggers, add an entry to the command map.
    for (const trigger of command.info.trigger) {
      if (this.triggerMap.has(trigger)) {
        const existingCommandInfo = this.triggerMap.get(trigger);
        const existing = `${existingCommandInfo.moduleName}.${existingCommandInfo.methodKey}()`;
        const current = `${command.moduleName}.${command.methodKey}()`;
        const message = `${current} tried to use the trigger "${trigger}, but it is already used by ${existing}`;
        log.warning('CommandLoader', message);
        continue;
      }
      // add it to the trigger map.
      this.triggerMap.set(trigger, command);
    }
    // add it to the list of commands for the module.
    if (!this.moduleMap.has(command.moduleName)) {
      this.moduleMap.set(command.moduleName, []);
    }
    this.moduleMap.get(command.moduleName).push(command);
  }

  /**
   * Returns whether or not there is a command using this trigger.
   * @param trigger The trigger to check for.
   */
  hasTrigger(trigger: string): boolean {
    return this.triggerMap.has(trigger);
  }

  /**
   * Invokes the command which uses the trigger.
   * @param trigger The trigger of the command to invoke.
   * @param client The client instance to provide to the command.
   * @param message The message which caused the invocation.
   */
  invoke(trigger: string, client: AphidClient, message: Message) {
    const cmd = this.triggerMap.get(trigger);
    const moduleInstance = modules.loader.getInstance(cmd.moduleName);
    moduleInstance[cmd.methodKey].call(moduleInstance, client, message);
  }
}
