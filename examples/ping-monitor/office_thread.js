/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';


// global variables: zetajs environment
let zetajs, css;

// global variables: demo specific
const max_values = 20;
let context, desktop, doc, ctrl, oldUrl;

// for debugging
let xComponent, charLocale, formatNumber, formatText, topwin, activeSheet, cellRange, dataAry;


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
    doc = desktop.loadComponentFromURL('file:///tmp/ping_monitor.ods', '_default', 0, []);
    ctrl = doc.getCurrentController();

    //topwin = css.awt.Toolkit.create(context).getActiveTopWindow();
    //topwin.setMenuBar(null);
    //topwin.FullScreen = true;
    //
    //// Workaround to hide scrollbars and sheet tabs:
    //// Move them behind the lower and right edges of the canvas.
    //topwin.setPosSize(0, 0, 1300+12, 600+40, 15);
    ////topwin.setPosSize(-40, 0, 1300+52, 600+40, 15);  // with "Formula Bar" and "RowColumnHeaders"

    // Turn off UI elements:
    dispatch('.uno:Sidebar');
    dispatch('.uno:InputLineVisible');  // FormulaBar at the top
    dispatch('.uno:ViewRowColumnHeaders');
    ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");

    activeSheet = ctrl.getActiveSheet();
    cellRange = activeSheet.getCellRangeByPosition(0, 1, 0, max_values+1);
    dataAry = cellRange.getDataArray();  // 2 dimensional array
    zetajs.mainPort.onmessage = function (e) {
        //topwin.setPosSize(0, 0, 1300+12, 600+40, 15);
        ////topwin.setPosSize(-40, 0, 1300+52, 600+40, 15);  // with "Formula Bar" and "RowColumnHeaders"
        switch (e.data.cmd) {
        case 'ping_result':
            const newUrl = e.data.url;
            if (newUrl == oldUrl) {
                moveRows(dataAry);
            } else {
                clearRows(dataAry);
            }
            oldUrl = newUrl;
            setCell(dataAry[max_values-1], e.data.ping_value);
            cellRange.setDataArray(dataAry);
            break;
        default:
            throw Error('Unknonwn message command ' + e.data.cmd);
        }
        // workaround topwin==null bug since about:
        //   https://git.libreoffice.org/core/+/c3d32f43aa956a745828d7357ac73825e0ed4cd7%5E%21
        topwin = css.awt.Toolkit.create(context).getActiveTopWindow();
        topwin.setMenuBar(null);
        topwin.FullScreen = true;
        // Workaround to hide scrollbars and sheet tabs:
        // Move them behind the lower and right edges of the canvas.
        topwin.setPosSize(0, 0, 1300+12, 600+40, 15);
        //topwin.setPosSize(-40, 0, 1300+52, 600+40, 15);  // with "Formula Bar" and "RowColumnHeaders"
    }

    zetajs.mainPort.postMessage({cmd: 'ready'});
}

function moveRows(ary) {
    for (let i = 0; i < max_values-1; i++) {
        const writeCell = ary[i];
        const readCell  = ary[i+1];
        const ping_value = readCell[0].val;
        setCell(writeCell, ping_value);
    }
}

function clearRows(ary) {
    for (let i = 0; i < max_values-1; i++) {
        setCell(ary[i], '');
    }
}

function setCell(cell, value) {
    let num = value;  // keep original value
    if (typeof(value) === 'number' || !isNaN(num=parseFloat(value))) {
        cell[0].type = Module.uno_Type.Double();
        cell[0].val = num;
    } else {
        cell[0].type = Module.uno_Type.String();
        cell[0].val = value.toString();
    }
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

Module.zetajs.then(function(pZetajs) {
    // initializing zetajs environment
    zetajs = pZetajs;
    css = zetajs.uno.com.sun.star;
    demo();  // launching demo
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
