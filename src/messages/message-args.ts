export interface MessageArgs {
  /**
   * Named parameters.
   */
  [name: string]: any;
  /**
   * Any arguments which don't correspond to command parameters.
   */
  rest: string[];
}
