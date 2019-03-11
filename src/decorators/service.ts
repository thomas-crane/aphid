import * as services from '../services';

export function Service(): ClassDecorator {
  return (target) => {
    services.factory.addService(target as any);
    return target;
  };
}
