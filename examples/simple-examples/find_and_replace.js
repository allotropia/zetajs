/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

"use strict";


// global variables - zetajs environment:
let zetajs, css;

// = global variables (some are global for easier debugging) =
// common variables:
let context, desktop, xModel, toolkit;
// example specific:
let searchDescriptor, xTextCursor;


function demo() {
  // Replaces every occurence of "LibreOffice" with "LIBRE-OFFICE YEAH".
  console.log('PLUS: execute example code');

  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);
  const in_path = 'file:///android/default-document/example.odt'
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);

  toolkit = css.awt.Toolkit.create(context);
  setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);

  searchDescriptor = xModel.createSearchDescriptor();
  searchDescriptor.setSearchString('LibreOffice');
  xTextCursor = xModel.findFirst(searchDescriptor);
  while (xTextCursor !== null) {
    //xTextCursor.goRight(0, false);  // Appending instead of replacing.
    xTextCursor.setString("LIBRE-OFFICE YEAH");
    xTextCursor = xModel.findNext(xTextCursor, searchDescriptor);
  }
}


import('./zeta.js').then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs.zetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
