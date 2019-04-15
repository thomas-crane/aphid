import * as commands from '../commands';
import { ParameterInfo } from '../commands/parameter-info';

export function Parameter(info: ParameterInfo): MethodDecorator {
    return (target, key) => {
      commands.loader.addParameter({
        moduleName: target.constructor.name,
        methodKey: key.toString(),
        info,
      });
    };
}
