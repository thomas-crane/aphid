import { InstanceStore } from '../models/instance-store';
import * as services from '../services';
import { LoadedModule } from './loaded-module';
import { ModuleInfo } from './module-info';

/**
 * A manager class for loading and storing modules.
 */
export class ModuleLoader {
  private moduleInfo: Map<string, ModuleInfo>;
  private modules: InstanceStore;
  constructor() {
    this.moduleInfo = new Map();
    this.modules = new InstanceStore();
  }

  loadModule<T extends object>(module: LoadedModule<T>) {
    /**
     * We only have the info and the constructor function of
     * the module class here, so we will pass it to the service
     * factory in order to create an actual instance.
     */
    const moduleInstance = services.factory.create(module.moduleType);
    this.modules.add(moduleInstance);
    this.moduleInfo.set(module.moduleType.name, module.info);
    /**
     * Now that we have an instance of the module, we want to
     * find any commands for that module.
     */
    // look for commands/restrictions.
  }

  /**
   * Returns the `ModuleInfo` of the module with the given name.
   * @param name The name of the module to get the `ModuleInfo` of.
   */
  getInfo(name: string): ModuleInfo {
    return this.moduleInfo.get(name);
  }

  /**
   * Gets the instance of the module with the given name.
   * @param name The name of the instance to get.
   */
  getInstance(name: string): any {
    return this.modules.get(name);
  }
}
