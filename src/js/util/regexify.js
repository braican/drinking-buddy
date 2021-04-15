export const regexify = string =>
  new RegExp(
    `^${string
      .replaceAll('/', '\\/')
      .replaceAll('*', '(.+)')
      .replaceAll(/:.+\/?/g, '(.+)')}$`,
  );
