/**
 * A class which can be used to log messages.
 */
export interface Logger {
  /**
   * Logs some debug information.
   * @param sender The sender of the message.
   * @param message The message to log.
   */
  debug(sender: string, message: string): void;
  /**
   * Logs some information.
   * @param sender The sender of the message.
   * @param message The message to log.
   */
  info(sender: string, message: string): void;
  /**
   * Logs a standard message.
   * @param sender The sender of the message.
   * @param message The message to log.
   */
  message(sender: string, message: string): void;
  /**
   * Logs a warning.
   * @param sender The sender of the message.
   * @param message The message to log.
   */
  warning(sender: string, message: string): void;
  /**
   * Logs an error.
   * @param sender The sender of the message.
   * @param message The message to log.
   */
  error(sender: string, message: string): void;
  /**
   * Logs a successful operation.
   * @param sender The sender of the message.
   * @param message The message to log.
   */
  success(sender: string, message: string): void;
}
