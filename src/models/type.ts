/**
 * A type which can be created using `new type()` syntax.
 */
export interface Type<T> extends Function {
  // tslint:disable-next-line: callable-types
  new(...args: any[]): T;
}
