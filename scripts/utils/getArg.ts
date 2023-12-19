export const getArg = (arg: string): string => {
  const args = process.argv.slice(2);
  const i = args.indexOf(`--${arg}`);

  if (i === -1 || i >= args.length - 1) {
    return '';
  }

  return args[i + 1];
};
