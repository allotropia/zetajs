# A ZetaJS Calc Demo using Vue.js

[online demo](https://zetaoffice.net/demos/vuejs3-ping-tool/)

For Vue.js-3 you'll need nodejs.  
And either you also install npm system wide or you use:  
`nodeenv --node=system --with-npm nodeenv/`  
https://packages.debian.org/bookworm/nodejs  
https://packages.debian.org/bookworm/nodeenv

# vuejs3

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

The following HTTP headers must be set in the web server configuration.
```
Cross-Origin-Opener-Policy "same-origin"
Cross-Origin-Embedder-Policy "require-corp"
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
