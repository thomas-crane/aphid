import 'reflect-metadata';
import { Reflections } from './reflections';

/**
 * Gets the constructor parameters of the given `target`.
 * Returns an empty array if there are no parameters.
 * @param target The class to get info about.
 */
export function getParams<T extends Function>(target: T): Function[] {
  const params: Function[] | undefined = Reflect.getMetadata(Reflections.ParamTypes, target);
  if (!params) {
    return [];
  }
  return params;
}
