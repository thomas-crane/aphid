/**
 * A command which can be used to invoke a method.
 */
export interface CommandInfo {
  /**
   * The name of this command
   */
  name: string;
  /**
   * A list of words which will trigger this command if used in a message.
   */
  trigger: string[];
  /**
   * A description of this command.
   */
  description: string;
}
