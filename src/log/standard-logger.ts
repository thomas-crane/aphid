import chalk from 'chalk';
import { Logger } from './logger';

/**
 * The default logger used by Aphid.
 */
export class StandardLogger implements Logger {

  debug(sender: string, message: string): void {
    this.logWithTime(chalk.gray(`[${sender}] ${message}`));
  }
  info(sender: string, message: string): void {
    this.logWithTime(chalk.gray(`[${sender}] ${message}`));
  }
  message(sender: string, message: string): void {
    this.logWithTime(chalk.white(`[${sender}] ${message}`));
  }
  warning(sender: string, message: string): void {
    this.logWithTime(chalk.yellowBright(`[${sender}] ${message}`));
  }
  error(sender: string, message: string): void {
    this.logWithTime(chalk.redBright(`[${sender}] ${message}`));
  }
  success(sender: string, message: string): void {
    this.logWithTime(chalk.greenBright(`[${sender}] ${message}`));
  }

  private logWithTime(message: string) {
    // tslint:disable-next-line: no-console
    console.log(`${chalk.gray(`[${this.getTime()}]`)} ${message}`);
  }

  private getTime(): string {
    return new Date().toISOString();
  }
}
