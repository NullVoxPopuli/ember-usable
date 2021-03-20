import { module, test } from 'qunit';
import { tracked } from 'tracked-built-ins';

import { use, Resource, useResource } from 'ember-could-get-used-to-this';

module('@use', () => {
  test('it works', async function (assert) {
    class TestResource extends Resource {
      constructor() {
        super(...arguments);

        this.firstArg = this.args.positional[0];
      }
    }

    class MyClass {
      @use test = TestResource.from(() => ['hello']);
    }

    let instance = new MyClass();

    assert.equal(instance.test.firstArg, 'hello');
  });

  test('resources update if args update', async function (assert) {
    class TestResource extends Resource {
      constructor() {
        super(...arguments);

        this.firstArg = this.args.positional[0];
      }
    }

    class MyClass {
      @tracked text = 'hello';

      @use test = TestResource.from(() => [this.text]);
    }

    let instance = new MyClass();

    assert.equal(instance.test.firstArg, 'hello');

    instance.text = 'world';

    assert.equal(instance.test.firstArg, 'world');
  });
});

module('useResource', () => {
  test('it works', async function (assert) {
    class TestResource extends Resource {
      constructor() {
        super(...arguments);

        this.firstArg = this.args.positional[0];
      }
    }

    class MyClass {
      test = useResource(this, TestResource, () => ['hello']);
    }

    let instance = new MyClass();

    assert.equal(instance.test.firstArg, 'hello');
  });

  test('example library api', async function (assert) {
    class FakeResource extends Resource {
      constructor() {
        super(...arguments);

        this.firstArg = this.args.positional[0];
      }
    }

    const useFake = (ctx, thunk) => useResource(ctx, FakeResource, () => [thunk()]);

    class MyClass {
      @tracked there = 'hello';

      test = useFake(this, () => this.there);
    }

    let instance = new MyClass();

    assert.equal(instance.test.firstArg, 'hello');

    instance.there = 'there';

    assert.equal(instance.test.firstArg, 'there');
  });
});
