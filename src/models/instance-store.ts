// we only want to store custom types in type stores, so
// we should not allow the following types to be stored.
// Number, Function, Boolean, String and Symbol *technically*
// aren't needed since these types fail the `typeof value !== 'object'`
// check, but they are included anyway for good measure.
const PROHIBITED_TYPES = new Set([
  Number.name,
  Function.name,
  Object.name,
  Boolean.name,
  String.name,
  Symbol.name,
]);

/**
 * A simple `Map` wrapper class designed to store instances of classes.
 */
export class InstanceStore {
  /**
   * The number of instances stored by this instance store.
   */
  get size() {
    return this.instances.size;
  }
  /**
   * The internal `Map` which is used to store class instances.
   */
  private instances: Map<string, any>;

  /**
   * Creates a new instance store.
   */
  constructor() {
    this.instances = new Map();
  }

  /**
   * Removes all instances from this instance store.
   */
  clear(): void {
    this.instances.clear();
  }

  /**
   * Removes the instance of the class called `name`. Returns
   * true if the instance was removed, and false otherwise.
   * @param key The name of the class instance to remove.
   */
  delete(key: string): boolean {
    return this.instances.delete(key);
  }

  /**
   * Gets the instance of the class called `name`. from this instance store.
   * Returns `undefined` if no instance with the name is stored.
   * @param name The name of the class instance to get.
   */
  get<T>(name: string): T | undefined {
    return this.instances.get(name) as T;
  }

  /**
   * Stores the instance of the class in this instance store.
   * @param value The instance of the class to store.
   */
  add<T extends object>(value: T): this {
    if (typeof value !== 'object'
      || typeof value.constructor !== 'function'
      || PROHIBITED_TYPES.has(value.constructor.name)) {
      throw new TypeError(`Parameter "value" should be a class instance, not ${typeof value}`);
    }
    this.instances.set(value.constructor.name, value);
    return this;
  }

  /**
   * Returns true if this instance store has an instance
   * of the class called `key` stored in it. Returns false otherwise.
   * @param key The key of the value to check for.
   */
  has(key: string): boolean {
    return this.instances.has(key);
  }
}
