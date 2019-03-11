import { expect } from 'chai';
import 'mocha';
import { InstanceStore } from '../../src/models/instance-store';

class NoOpClass1 { }
// tslint:disable-next-line: max-classes-per-file
class NoOpClass2 { }

describe('InstanceStore', () => {
  describe('#size', () => {
    it('should represent the number of instances stored.', () => {
      const store = new InstanceStore();
      expect(store.size).to.equal(0, 'Incorrect initial size.');
      store.add(new NoOpClass1());
      expect(store.size).to.equal(1, 'Incorrect size after add.');
      store.add(new NoOpClass2());
      expect(store.size).to.equal(2, 'Incorrect size after second add.');
    });
  });
  describe('#clear()', () => {
    it('should remove all instances from the store.', () => {
      const store = new InstanceStore();
      store.add(new NoOpClass1());
      store.add(new NoOpClass2());
      store.clear();
      expect(store.size).to.equal(0, 'Store not cleared.');
    });
  });
  describe('#delete()', () => {
    it('should remove the specified instance from the store.', () => {
      const store = new InstanceStore();
      store.add(new NoOpClass1());
      store.add(new NoOpClass2());
      store.delete(NoOpClass2.name);
      expect(store.has(NoOpClass2.name)).to.equal(false, 'Instance not removed.');
    });
    it('should return true if the instance was removed.', () => {
      const store = new InstanceStore();
      store.add(new NoOpClass1());
      const result = store.delete(NoOpClass1.name);
      expect(result).to.equal(true, 'Result was not true.');
    });
    it('should return false if the instance was not removed.', () => {
      const store = new InstanceStore();
      store.add(new NoOpClass1());
      const result = store.delete(NoOpClass2.name);
      expect(result).to.equal(false, 'Result was not false.');
    });
  });
  describe('#get()', () => {
    it('should return the instance of the class.', () => {
      const store = new InstanceStore();
      const inst1 = new NoOpClass1();
      const inst2 = new NoOpClass2();
      store.add(inst1);
      store.add(inst2);
      expect(store.get(NoOpClass2.name)).to.equal(inst2, 'Did not get correct instance.');
    });
    it('should return undefined if it has no stored instance of the class.', () => {
      const store = new InstanceStore();
      store.add(new NoOpClass1());
      expect(store.get(NoOpClass2.name)).to.equal(undefined, 'Did not return undefined for non-stored instance.');
    });
  });
  describe('#add()', () => {
    it('should throw an error if the value is not a custom class instance.', () => {
      const store = new InstanceStore();
      expect(() => store.add(NoOpClass1), 'Did not throw for class type.').to.throw(TypeError);
      expect(() => store.add(432 as any), 'Did not throw for number.').to.throw(TypeError);
      expect(() => store.add({}), 'Did not throw for object.').to.throw(TypeError);
      expect(() => store.add(() => undefined), 'Did not throw for function.').to.throw(TypeError);
      expect(() => store.add(true as any), 'Did not throw for boolean.').to.throw(TypeError);
      expect(() => store.add(Symbol('test') as any), 'Did not throw for symbol.').to.throw(TypeError);
    });
    it('should add the instance to the store.', () => {
      const store = new InstanceStore();
      const inst = new NoOpClass1();
      store.add(inst);
      expect(store.get(NoOpClass1.name)).to.equal(inst, 'Instance not stored.');
    });
    it('should not store more than one of the same instance.', () => {
      const store = new InstanceStore();
      store.add(new NoOpClass1());
      store.add(new NoOpClass1());
      store.add(new NoOpClass1());
      expect(store.size).to.equal(1, 'Multiple instances stored.');
    });
    it('should overwrite old instances if a new instance is added.', () => {
      const store = new InstanceStore();
      const oldInstance = new NoOpClass1();
      const newInstance = new NoOpClass1();
      store.add(oldInstance);
      store.add(newInstance);
      expect(store.get(NoOpClass1.name)).to.equal(newInstance, 'Newest instance not stored.');
    });
  });
  describe('#has()', () => {
    const store = new InstanceStore();
    store.add(new NoOpClass1());
    it('should return true if the instance store has an instance of the class stored.', () => {
      expect(store.has(NoOpClass1.name)).to.equal(true, 'Did not return true for stored instance.');
    });
    it('should return false if the instance store does not have an instance of the class stored.', () => {
      expect(store.has(NoOpClass2.name)).to.equal(false, 'Returned true for non-stored instance.');
    });
  });
});
