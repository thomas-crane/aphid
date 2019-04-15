import { ParameterInfo } from './parameter-info';

/**
 * A command which has been loaded.
 */
export interface LoadedParameter {
  /**
   * The name of the module which this parameter belongs to.
   */
  moduleName: string;
  /**
   * The name of the function which this parameter decorates.
   */
  methodKey: string;
  /**
   * The info about this parameter.
   */
  info: ParameterInfo;
}
