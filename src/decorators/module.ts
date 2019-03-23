import * as modules from '../modules';
import { ModuleInfo } from '../modules/module-info';

/**
 * A class which contains several command methods.
 * @param info Information about this module.
 */
export function Module(info: ModuleInfo): ClassDecorator {
  return (target) => {
    /**
     * Here, we are passing the module info and
     * the constructor function of the module class
     * to the module loader.
     */
    modules.loader.loadModule({
      info,
      moduleType: target as any,
    });
    return target;
  };
}
