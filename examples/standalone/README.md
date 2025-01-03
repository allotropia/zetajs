An example of a stripped-down, standalone Writer document canvas without any surrounding menubars,
toolbars, side panels, etc. Includes HTML buttons to for simple formatting (bold, italic, underlined).

See config.sample.js for configuration options.

[online demo](https://zetaoffice.net/demos/standalone/)

## Run local for development

To run the example, do
```
npm install
npm start
```

## Using with a web server

For getting files you can put on a web server, do
```
npm install
npm run dist
```

The following HTTP headers must be set in the web server configuration.
```
Cross-Origin-Opener-Policy "same-origin"
Cross-Origin-Embedder-Policy "require-corp"
```

Attention: When using in production, replace the zetajs 'file:' link in `package.json` with a proper version from npmjs.com.
