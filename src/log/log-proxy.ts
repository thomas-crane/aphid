import { Logger } from './logger';
import { StandardLogger } from './standard-logger';

/**
 * Provides an interface where log commands can be called on
 * a potentially undefined logger.
 */
export class LogProxy implements Logger {
  private logger: Logger;

  constructor() {
    this.logger = new StandardLogger();
  }

  /**
   * Sets the logger which log methods will be called on.
   * @param logger The logger to use.
   */
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  debug(sender: string, message: string): void {
    if (this.logger) {
      this.logger.debug(sender, message);
    }
  }
  info(sender: string, message: string): void {
    if (this.logger) {
      this.logger.info(sender, message);
    }
  }
  message(sender: string, message: string): void {
    if (this.logger) {
      this.logger.message(sender, message);
    }
  }
  warning(sender: string, message: string): void {
    if (this.logger) {
      this.logger.warning(sender, message);
    }
  }
  error(sender: string, message: string): void {
    if (this.logger) {
      this.logger.error(sender, message);
    }
  }
  success(sender: string, message: string): void {
    if (this.logger) {
      this.logger.success(sender, message);
    }
  }
}
