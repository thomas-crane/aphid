import { expect } from 'chai';
import 'mocha';
import { ServiceFactory } from '../../src/services/service-factory';

/**
 * We need a decorator in order for reflect-metadata to give us
 * type information so the factory can determine dependencies.
 */
function DummyDecorator(): ClassDecorator {
  return (target) => target;
}

@DummyDecorator()
class NoDeps {
  value: number;
  constructor() {
    this.value = 10;
  }

  changeValue(newValue: number) {
    this.value = newValue;
  }
}

// tslint:disable-next-line: max-classes-per-file
@DummyDecorator()
class HasDep {
  constructor(public noDep: NoDeps) { }
}

// tslint:disable-next-line: max-classes-per-file
@DummyDecorator()
class HasUnmeetableDep {
  str: string;
  constructor(silly: string) {
    this.str = silly;
  }
}

describe('ServiceFactory', () => {
  describe('#addService', () => {
    it('should make the service available to be provided as a dependency.', () => {
      const factory = new ServiceFactory();
      // the missing dependency should throw.
      expect(() => factory.create(HasDep), 'Did not throw for missing dependency.').to.throw();
      factory.addService(NoDeps);
      // now that the dependency is available, this should not throw.
      expect(() => factory.create(HasDep), 'Threw after adding required dependency.').not.to.throw();
    });
  });
  describe('#create()', () => {
    const factory = new ServiceFactory();
    factory.addService(NoDeps);
    it('should throw an error if the value is not a class type.', () => {
      expect(() => factory.create(new NoDeps() as any), 'Did not throw for class instance.').to.throw(TypeError);
      expect(() => factory.create('hello' as any), 'Did not throw for string.').to.throw(TypeError);
      expect(() => factory.create(452 as any), 'Did not throw for number.').to.throw(TypeError);
      expect(() => factory.create(((): any => undefined) as any), 'Did not throw for function.').to.throw(TypeError);
      expect(() => factory.create({} as any), 'Did not throw for object literal.').to.throw(TypeError);
      expect(() => factory.create(undefined), 'Did not throw for undefined.').to.throw(TypeError);
      expect(() => factory.create(null), 'Did not throw for null.').to.throw(TypeError);
      expect(() => factory.create(Number), 'Did not throw for Number type.').to.throw(TypeError);
      expect(() => factory.create(Function), 'Did not throw for Function type.').to.throw(TypeError);
      expect(() => factory.create(Object), 'Did not throw for Object type.').to.throw(TypeError);
    });
    it('should create the desired instance.', () => {
      const inst = factory.create(NoDeps);
      expect(inst instanceof NoDeps).to.equal(true, 'Did not create an instance of the correct type.');
    });
    it('should throw if the required dependencies are not available.', () => {
      expect(() => factory.create(HasUnmeetableDep), 'Did not throw for missing dependency.').to.throw();
    });
    it('should create the instance the required dependencies.', () => {
      const inst = factory.create(HasDep);
      expect(inst.noDep instanceof NoDeps).to.equal(true, 'Did not inject required instance.');
    });
    it('should always inject the same instead when injecting dependencies.', () => {
      const inst1 = factory.create(HasDep);
      const inst2 = factory.create(HasDep);
      // if the injected instance was the same for both created
      // instances, we should see changes affect both instances.
      inst1.noDep.value = 24;
      expect(inst2.noDep.value).to.equal(24, 'Different instances injected upon creation.');
    });
  });
});
