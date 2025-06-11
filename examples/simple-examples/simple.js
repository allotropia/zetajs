/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';


// global variables - zetajs environment:
let zetajs, css;

// = global variables (some are global for easier debugging) =
// common variables:
let context, desktop, xModel, toolkit;
// example specific:
let xText, xTextCursor;


function demo() {
  // Adapted sample code from <https://git.libreoffice.org/core> static/README.wasm.md:
  console.log('PLUS: execute example code');

  // load document
  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);
  xModel = desktop.getCurrentFrame().getController().getModel();
  if (!xModel?.queryInterface(zetajs.type.interface(css.text.XTextDocument))) {
    xModel = desktop.loadComponentFromURL(
      'file:///android/default-document/example.odt', '_default', 0, []);
  }
  toolkit = css.awt.Toolkit.create(context);
  setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);
  xText = xModel.getText();

  // insert string
  xTextCursor = xText.createTextCursor();
  xTextCursor.setString("string here!");

  // colorize paragraphs
  const xParaEnumeration = xText.createEnumeration();
  for (const xParagraph of xParaEnumeration) {
    const color = Math.floor(Math.random() * 0xFFFFFF);
    xParagraph.setPropertyValue("CharColor", color);
  }
}


import('./zeta.js').then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs.zetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
