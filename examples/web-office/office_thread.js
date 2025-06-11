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
let context, desktop, xModel, ctrl;


function demo() {
  context = zetajs.getUnoComponentContext();
  const bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
  const bean_odt_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer8'});
  desktop = css.frame.Desktop.create(context);

  zetajs.mainPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'upload':
      loadFile(e.data.filename);
      break;
    case 'download':
      xModel.store();
      zetajs.mainPort.postMessage({cmd: 'download', id: e.data.id});
      break;
    default:
      throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
  zetajs.mainPort.postMessage({cmd: 'thr_running'});
}

function loadFile(filename) {
  const in_path = 'file:///tmp/office/' + filename;
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  ctrl = xModel.getCurrentController();
  ctrl.getFrame().getContainerWindow().FullScreen = true;
  zetajs.mainPort.postMessage({cmd: 'ui_ready'});
}

import('./assets/vendor/zetajs/zeta.js').then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs.zetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
