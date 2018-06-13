const REPO_ROOT = require('path').resolve(__dirname, '..');


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
