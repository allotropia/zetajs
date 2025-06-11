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

  // Turn off toolbars:
  const config = css.configuration.ReadWriteAccess.create(context, 'en-US');
  const uielems = config.getByHierarchicalName(
    '/org.openoffice.Office.UI.WriterWindowState/UIElements/States');
  for (const i of uielems.getElementNames()) {
    const uielem = uielems.getByName(i);
    if (uielem.getByName('Visible')) {
      uielem.setPropertyValue('Visible', false);
    }
  }
  config.commitChanges();

  desktop = css.frame.Desktop.create(context);
  xModel = desktop.loadComponentFromURL('private:factory/swriter', '_default', 0, [])
  ctrl = xModel.getCurrentController();
  ctrl.getFrame().getContainerWindow().FullScreen = true;

  ctrl.getFrame().LayoutManager.hideElement("private:resource/menubar/menubar");

  // Turn off sidebar:
  dispatch('.uno:Sidebar');

  for (const id of 'Bold Italic Underline'.split(' ')) {
    const urlObj = transformUrl('.uno:' + id);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
      disposing: function(source) {},
      statusChanged: function(state) {
        state = zetajs.fromAny(state.State);
        // Behave like desktop UI if a non uniformly formatted area is selected.
        if (typeof state !== 'boolean') state = false;  // like desktop UI
        zetajs.mainPort.postMessage({cmd: 'setFormat', id, state});
      }
    });
    queryDispatch(urlObj).addStatusListener(listener, urlObj);
  }

  zetajs.mainPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'toggleFormatting':
      dispatch('.uno:' + e.data.id);
      break;
    default:
      throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
  zetajs.mainPort.postMessage({cmd: 'ui_ready'});
}

function transformUrl(unoUrl) {
  const ioparam = {val: new css.util.URL({Complete: unoUrl})};
  css.util.URLTransformer.create(context).parseStrict(ioparam);
  return ioparam.val;
}

function queryDispatch(urlObj) {
  return ctrl.queryDispatch(urlObj, '_self', 0);
}

function dispatch(unoUrl) {
  const urlObj = transformUrl(unoUrl);
  queryDispatch(urlObj).dispatch(urlObj, []);
}

import('./assets/vendor/zetajs/zeta.js').then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs.zetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
