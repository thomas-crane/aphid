import { Type } from '../models/type';
import { ModuleInfo } from './module-info';

export interface LoadedModule<T> {
  info: ModuleInfo;
  moduleType: Type<T>;
}
