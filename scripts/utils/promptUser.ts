export function promptUser(question: string): Promise<string> {
  return new Promise(resolve => {
    process.stdout.write(question);

    process.stdin.once('data', data => {
      const answer = data.toString().trim();
      resolve(answer);
    });
  });
}
