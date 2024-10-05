/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';


// global variables: zetajs environment
let zetajs, css;

// global variables: demo specific
let context, desktop, doc, ctrl, urls, ping_line;

let xComponent, charLocale, formatNumber, formatText, activeSheet, cell;  // for debugging


function demo() {
    context = zetajs.getUnoComponentContext();

    // Turn off toolbars:
    const config = css.configuration.ReadWriteAccess.create(context, 'en-US')
    const uielems = zetajs.fromAny(
        config.getByHierarchicalName(
            '/org.openoffice.Office.UI.CalcWindowState/UIElements/States'));
    for (const i of uielems.getElementNames()) {
        const uielem = zetajs.fromAny(uielems.getByName(i));
        if (zetajs.fromAny(uielem.getByName('Visible'))) {
            uielem.setPropertyValue('Visible', false);
        }
    }
    config.commitChanges();

    desktop = css.frame.Desktop.create(context);
    doc = desktop.loadComponentFromURL('file:///tmp/calc_ping_example.ods', '_default', 0, []);
    ctrl = doc.getCurrentController();
    xComponent = ctrl.getModel();
    charLocale = zetajs.fromAny(xComponent.getPropertyValue('CharLocale'));
    formatNumber = xComponent.getNumberFormats().
        queryKey('0', charLocale, false);
    formatText = xComponent.getNumberFormats().
        queryKey('@', charLocale, false);

    const topwin = css.awt.Toolkit.create(context).getActiveTopWindow();
    topwin.FullScreen = true;
    topwin.setMenuBar(null);

    // Turn off sidebar:
    dispatch('.uno:Sidebar');
    // Turn off statusbar:
    ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");

    urls = {};
    button('bold', '.uno:Bold');
    button('italic', '.uno:Italic');
    button('underline', '.uno:Underline');

    activeSheet = ctrl.getActiveSheet();
    zetajs.mainPort.onmessage = function (e) {
        switch (e.data.cmd) {
        case 'toggle':
            dispatch(urls[e.data.id]);
            break;
        case 'ping_result':
            if (ping_line === undefined) {
                ping_line = 1;  // overwrite example.org
            } else {
                ping_line = findEmptyRowInCol1(activeSheet);
            }

            const url = e.data.id['url'];
            cell = activeSheet.getCellByPosition(0, ping_line);
            cell.setPropertyValue('NumberFormat', formatText);  // optional
            cell.setString((new URL(url)).hostname);

            cell = activeSheet.getCellByPosition(1, ping_line);
            let ping_value = String(e.data.id['data']);
            if (!isNaN(ping_value)) {
              cell.setPropertyValue('NumberFormat', formatNumber);  // optional
              cell.setValue(parseFloat(ping_value));
            } else {
              // in case e.data.id['data'] contains an error message
              cell.setPropertyValue('NumberFormat', formatText);  // optional
              cell.setString(ping_value);
            }
            break;
        default:
            throw Error('Unknonwn message command ' + e.data.cmd);
        }
    }

    zetajs.mainPort.postMessage({cmd: 'ready'});
}

function findEmptyRowInCol1(activeSheet) {
    let str;
    let line = 0;
    while (str != "") {
        line++;
        str = activeSheet.getCellByPosition(0, line).getString();
    }
    return line;
}

function button(id, url) {
    urls[id] = url;
    const urlObj = transformUrl(url);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
        disposing: function(source) {},
        statusChanged: function(state) {
            zetajs.mainPort.postMessage({cmd: 'state', id, state: zetajs.fromAny(state.State)});
        }
    });
    queryDispatch(urlObj).addStatusListener(listener, urlObj);
    zetajs.mainPort.postMessage({cmd: 'enable', id});
}

function transformUrl(url) {
    const ioparam = {val: new css.util.URL({Complete: url})};
    css.util.URLTransformer.create(context).parseStrict(ioparam);
    return ioparam.val;
}

function queryDispatch(urlObj) {
    return ctrl.queryDispatch(urlObj, '_self', 0);
}

function dispatch(url) {
    const urlObj = transformUrl(url);
    queryDispatch(urlObj).dispatch(urlObj, []);
}

const interval = setInterval(function() {
    // sometimes Module.zetajs isn't immediately available in Firefox~128
    if (typeof Module.zetajs === 'undefined') return;
    clearInterval(interval);
    Module.zetajs.then(function(pZetajs) {
        // initializing zetajs environment
        zetajs = pZetajs;
        css = zetajs.uno.com.sun.star;
        demo();  // launching demo
    });
}, 100);  // milliseconds

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
