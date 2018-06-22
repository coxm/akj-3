const REPO_ROOT = require('path').resolve(__dirname, '..');


console.log('Starting webpack build');
require('webpack')(require('./webpack.config'), (err, stats) => {
  if (err) {
    console.error(err);
  }
  else if (stats.hasErrors()) {
    console.error('Stats errors', stats);
  }
  else {
    console.log('Build successful');
  }
});


console.log('Optimising images: invoking Make...');
const make = require('child_process').spawn(
  'make', ['-C', '.', '-f', 'script/Makefile']);
make.stdout.on('data', (data) => {
  console.log(`${data}`);
});

make.stderr.on('data', (data) => {
  console.error(`${data}`);
});

make.on('close', (code) => {
  console.log(`make: exiting with code ${code}`);
});
