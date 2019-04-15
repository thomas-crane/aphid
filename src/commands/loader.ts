import log from '../log';
import { LoadedCommand } from './loaded-command';
import { LoadedParameter } from './loaded-parameter';

type ParameterMap = Map<string, LoadedParameter[]>;

/**
 * A manager class for loading and storing commands.
 */
export class CommandLoader {
  private triggerMap: Map<string, LoadedCommand>;
  private moduleMap: Map<string, LoadedCommand[]>;

  private parameterMap: Map<string, ParameterMap>;

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
   * Adds the parameter to the parameter map of this command loader.
   * @param parameter The parameter to add.
   */
  addParameter(parameter: LoadedParameter) {
    if (!this.parameterMap.has(parameter.moduleName)) {
      this.parameterMap.set(parameter.moduleName, new Map());
    }
    const paramMap = this.parameterMap.get(parameter.moduleName);
    if (!paramMap.has(parameter.methodKey)) {
      paramMap.set(parameter.methodKey, []);
    }
    // make sure no parameter with the same name already exists. Produce a warning if it does.
    // ...
    paramMap.get(parameter.methodKey).push(parameter);
  }

  /**
   * Returns whether or not there is a command using this trigger.
   * @param trigger The trigger to check for.
   */
  hasTrigger(trigger: string): boolean {
    return this.triggerMap.has(trigger);
  }

  /**
   * Gets the command which is using this trigger.
   * @param trigger The trigger of the command to get.
   */
  getCommand(trigger: string): [LoadedCommand, LoadedParameter[]] {
    const cmd = this.triggerMap.get(trigger);
    const parameters = this.parameterMap.get(cmd.moduleName).get(cmd.methodKey);
    return [cmd, parameters];
  }
}
