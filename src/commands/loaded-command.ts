import { CommandInfo } from './command-info';

/**
 * A command which has been loaded.
 */
export interface LoadedCommand {
  /**
   * The name of the module which this command belongs to.
   */
  moduleName: string;
  /**
   * The name of the function which this command decorates.
   */
  methodKey: string;
  /**
   * The info about this command.
   */
  info: CommandInfo;
}
