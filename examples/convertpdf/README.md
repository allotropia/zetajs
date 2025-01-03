An example of a local file to PDF conversion service.  If the "Download" button is checked, the
converted PDF document is downloaded to the local file system, in addition to being shown in an
iframe on the web page.

See config.sample.js for configuration options.

[online demo](https://zetaoffice.net/demos/convertpdf/)

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
