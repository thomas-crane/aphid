import { InstanceStore } from '../models/instance-store';
import { Type } from '../models/type';
import * as reflection from '../reflection';

/**
 * A class for creating instances of classes which depend upon `@Service` classes.
 */
export class ServiceFactory {
  /**
   * The instance store used for storing `@Service` class instances.
   */
  private store: InstanceStore;
  constructor() {
    this.store = new InstanceStore();
  }
  /**
   * Creates an instance of the `type` and provides the necessary constructor arguments.
   * @param type The type to create.
   */
  create<T>(type: Type<T>): T {
    if (typeof type !== 'function'
      || typeof (type.constructor) !== 'function'
      || type.constructor.name !== Function.name) {
      throw new Error(`Parameter "type" should be a class type, not ${typeof type}`);
    }
    const dependencies = reflection.util.getParams(type);

    // make sure we have a stored instance of all of the dependencies.
    for (const dependency of dependencies) {
      if (!this.store.has(dependency.name)) {
        throw new Error(`${type.name} depends on ${dependency.name}, but ${dependency.name} is not loaded.`);
      }
    }

    // get all of the dependencies.
    const args = dependencies.map((dependency) => this.store.get(dependency.name));
    return new type(...args);
  }

  /**
   * Adds a service to the services which this factory can provide.
   * @param type The type of service to create.
   */
  addService<T extends object>(type: Type<T>) {
    const service = this.create(type);
    if (service) {
      this.store.add(service);
    }
  }
}
