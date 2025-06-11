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
let myXKeyHandler, evtPressed, evtReleased, xController;


function demo() {
  console.log('PLUS: execute example code');

  /* Implements com.sun.star.awt.XKeyHandler
   * Outputs printable characters typed into the OfficeDocument.
   * Browser console is used for output.
   */
  myXKeyHandler = zetajs.unoObject(
    [css.awt.XKeyHandler],
    {
      keyPressed(e) {
        console.log('key pressed (' + e.KeyCode + "): " + e.KeyChar);
        evtPressed = e;
        return false;  // false: don't consume (run other event handlers)
      },
      keyReleased(e) {
        console.log('key released (' + e.KeyCode + "): " + e.KeyChar);
        evtReleased = e;
        return false;  // false: don't consume (run other event handlers)
      }
    });

  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);
  // Open a new writer document.
  // xModel is somethink like: SwXTextDocument, ScModelObj, SdXImpressDocument
  xModel = desktop.loadComponentFromURL('private:factory/swriter', '_default', 0, []);
  xController = xModel.getCurrentController();

  toolkit = css.awt.Toolkit.create(context);
  setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);

  xController.addKeyHandler(myXKeyHandler);
  // addKeyListener != addKeyHandler (that's something very DIFFERENT)

  const xText = xModel.getText();
  const xTextCursor = xText.createTextCursor();
  xTextCursor.setString("Open browser console and type something in LibreOffice!");
}


import('./zeta.js').then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs.zetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
