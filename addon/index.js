import { invokeHelper } from '@ember/helper';
import { getValue } from '@glimmer/tracking/primitives/cache';

export { modifier, Modifier } from './-private/modifiers';
export { Resource } from './-private/resources';

function normalizeArgs(args) {
  if (Array.isArray(args)) {
    return { positional: args };
  }

  if ('positional' in args || 'named' in args) {
    return args;
  }

  if (typeof args === 'object') {
    return { named: args };
  }

  return args;
}

export function use(prototype, key, desc) {
  let resources = new WeakMap();
  let { initializer } = desc;

  return {
    get() {
      let resource = resources.get(this);

      if (!resource) {
        let { definition, thunk } = initializer.call(this);

        resource = invokeHelper(this, definition, () => {
          let args = thunk();
          let reified = normalizeArgs(args);

          return reified;
        });

        resources.set(this, resource);
      }

      return getValue(resource);
    },
  };
}

export function useUnproxiedResource(destroyable, definition, args) {
  let resource;

  return {
    get value() {
      if (!resource) {
        resource = invokeHelper(
          destroyable,
          definition,
          () => {
            return normalizeArgs(args?.() || {});
          }
        );
      }

      return getValue(resource);
    }
  };
}

export function useResource(destroyable, definition, args) {
  const target = useUnproxiedResource(destroyable, definition, args);

  return (new Proxy(target, {
    get(target, key) {
      const instance = target.value;
      const value = Reflect.get(instance, key, instance);

      return typeof value === 'function' ? value.bind(instance) : value;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.value);
    },
    getOwnPropertyDescriptor(target, key) {
      return Reflect.getOwnPropertyDescriptor(target.value, key);
    }
  }))
}
