import { ParameterKind } from '../messages/parameter-kind';

export interface ParameterInfo {
  /**
   * The name of the parameter.
   */
  name: string;
  /**
   * A description of the parameter.
   */
  description: string;
  /**
   * The type of this parameter. @see ParameterKind for available types.
   */
  kind: ParameterKind;
  /**
   * An optional range to restrict the values of the parameter.
   * If this is not provided then the domain of values will be unbounded.
   */
  // range?: Range;
  /**
   * An optional boolean to indicate whether or not this parameter is
   * required. This will default to true.
   */
  required?: boolean;
}
