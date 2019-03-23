import * as commands from '../commands';
import { CommandInfo } from '../commands/command-info';
import log = require('../log');

export function Command(info: CommandInfo): MethodDecorator {
  return (target, key) => {
    // commands need at least one trigger
    if (info.trigger.length < 1) {
      log.error('Command', `The command ${target.constructor.name}.${key.toString()}() needs at least one trigger.`);
    }
    /**
     * Here, we are passing the name of the constructor function
     * of the class which this method is in (e.g. the module name),
     * and the name of the command function itself.
     */
    commands.loader.addCommand({
      moduleName: target.constructor.name,
      methodKey: key.toString(),
      info,
    });
  };
}
