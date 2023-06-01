import fs from 'fs';

const path = './data/user.json';

fs.readFile(path, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const json = JSON.parse(data.toString());

  console.log(json);
});