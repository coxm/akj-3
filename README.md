# Alakajam 3: "always growing"
Forked from a basecode repository [here](https://github.com/coxm/es6-phaser3-basecode).

## Getting started (development)
Install packages:

    yarn # Or `npm i`, if you prefer.

Start the dev server at port 3000:

    yarn start # Or `npm start`.

Alternatively, to use a different port:

    PORT=3001 yarn start

## Production builds
Run

    yarn build

This creates a `build/dist/` directory containing all distributable files. Other build outputs which aren't for distribution (such as sourcemaps) are stored in `build/` alongside the `dist/` directory.

## Finding things
### Source
Source files (JS, HTML, CSS) are all in `src/`. In particular CSS files live under `src/css` and the HTML is loaded as EJS templates from `src/ejs`, using [ejs-loader](https://github.com/okonet/ejs-loader).

### Scripts and configuration
All scripts and config (e.g. `webpack.config.js`) live under `scripts/`, and some have NPM scripts defined in `package.json`.

## Licenses
The `apocalypse.png` tileset (from [here](https://opengameart.org/content/post-apocalyptic-16x16-tileset-update1)) was made available under the [Creative Commons CC-BY-SA 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/). Everything else is available under the MIT license.
