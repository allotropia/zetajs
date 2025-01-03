These are small examples that showcase code snippets how to programmatically interact with
documents.

## Online demos

- [find_and_replace.html](https://zetaoffice.net/demos/simple-examples/find_and_replace.html)
- [rainbow_writer.html](https://zetaoffice.net/demos/simple-examples/rainbow_writer.html)
- [simple.html](https://zetaoffice.net/demos/simple-examples/simple.html)
- [simple_key_handler.html](https://zetaoffice.net/demos/simple-examples/simple_key_handler.html)

## Running the examples

Put the whole Git repo into a webservers webroot. The whole Git repo is needed, because this directory has a symlink to "../../source/zeta.js".

The following HTTP headers must be set in the webserver configuration.
```
Cross-Origin-Opener-Policy "same-origin"
Cross-Origin-Embedder-Policy "require-corp"
```

You might configure a webserver like Apache for this. Or you use emrun which comes has Emscripten and sets this headers by default. (replace rainbow_writer.html with the simple-example you like to run)
```
$ emrun rainbow_writer.html
```

### Alternative: Build LOWA with EMSCRIPTEN_EXTRA_SOFFICE_PRE_JS

One way to run some of the provided example and test code is to serve those files next to `qt_soffice.html`, along with some `include.js` that looks like
```
Module.uno_scripts = [
    'zetajs/source/zeta.js',
    'zetajs/examples/rainbow_writer.js'];
```
(or whatever the paths where you serve them, relative to `qt_soffice.html`; `zeta.js` always needs to come first), and to build LOWA with an `EMSCRIPTEN_EXTRA_SOFFICE_PRE_JS=/path/to/include.js` configuration option (e.g., as a line in `autogen.input`), with `/path/to` adapted accordingly.  (The `test/smoketest.js` code requires a LibreOffice configured with `--enable-dbgutil` to have the `org.libreoffice.embindtest` UNOIDL entities available.)
