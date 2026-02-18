export const createEnum = (obj, options = {}) =>
  Object.entries(obj).reduce(
    (acc, [key, value], index) => ({
      ...acc,
      [key]: {
        ...options.defaultFields,
        name: key,
        index,
        ...value,
      },
    }),
    {}
  );
