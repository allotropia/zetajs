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
let uno_bold, uno_font_monospace;

//              [     red,   orange,   yellow,    green,     blue,   violet]
const rainbow = [0xE50000, 0xF08500, 0xFFEE00, 0x008121, 0x004CFF, 0x760188];


function demo() {
  console.log('PLUS: execute example code');

  uno_bold = css.awt.FontWeight.BOLD;
  uno_font_monospace = "Monospace";

  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);
  //// Open a new writer document.
  xModel = desktop.loadComponentFromURL('private:factory/swriter', '_default', 0, []);

  toolkit = css.awt.Toolkit.create(context);
  setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);

  const xController = xModel.getCurrentController();
  const xKeyHandler = zetajs.unoObject([css.awt.XKeyHandler], new ColorXKeyHandler(xModel));
  xController.addKeyHandler(xKeyHandler);                   // XUserInputInterception.addKeyHandler()

  const xTextCursor = xModel.getText().createTextCursor();  // XTextDocument.getText()
  xTextCursor.setPropertyValue("CharWeight", uno_bold);     // XPropertySet.setPropertyValue()
  xTextCursor.setString("Please type something!\n\n");
}


function ColorXKeyHandler(xModel) {
  this.rainbow_i = 0;
  this.xModel = null;
  this.keyPressed = function(e) { return false; };
  this.keyReleased = function(e) {
    if (e.KeyChar === "\x00") { return false; }  // non symbol keys (e.g. arrow keys)

    const xController = this.xModel.getCurrentController();
    const xTextViewCursor = xController.getViewCursor();  // XTextViewCursorSupplier.getViewCursor()
    const xText = this.xModel.getText();  // XTextDocument.getText()
    const xTextCursor = xText.createTextCursorByRange(xTextViewCursor.getStart());
    xTextCursor.goLeft(1, true);

    // Walk the rainbow ;-)
    const color = rainbow[this.rainbow_i];
    this.rainbow_i++;
    if (this.rainbow_i >= rainbow.length) { this.rainbow_i = 0; }

    xTextCursor.setPropertyValue("CharBackColor", color);  // xPropertySet.setPropertyValue
    xTextCursor.setPropertyValue("CharWeight", uno_bold);
    xTextCursor.setPropertyValue("CharFontName", uno_font_monospace);
    // More properties:
    //   https://api.libreoffice.org/docs/idl/ref/servicecom_1_1sun_1_1star_1_1style_1_1CharacterProperties.html

    return false;
  };

  const xModel_types = xModel.getTypes();  // XTypeProvider.getTypes()
  for (let i=0; i<xModel_types.length; i++) {
    if (xModel_types[i].toString() == "com.sun.star.text.XTextDocument") {
      i = xModel_types.length + 1;
      this.xModel = xModel;
    }
  }
};


import('./zeta.js').then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs.zetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
