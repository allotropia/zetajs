/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';


// global variables: zetajs environment
let zetajs, css;

// global variables: demo specific
let context, ctrl, urls;


function demo() {
    context = zetajs.getUnoComponentContext();

    // Turn off toolbars:
    const config = css.configuration.ReadWriteAccess.create(context, 'en-US')
    const uielems = config.getByHierarchicalName(
        '/org.openoffice.Office.UI.WriterWindowState/UIElements/States');
    for (const i of uielems.getElementNames()) {
        const uielem = uielems.getByName(i);
        if (uielem.getByName('Visible')) {
            uielem.setPropertyValue('Visible', false);
        }
    }
    config.commitChanges();

    ctrl = css.frame.Desktop.create(context)
          .loadComponentFromURL('private:factory/swriter', '_default', 0, [])
          .getCurrentController();

    // css.awt.XExtendedToolkit::getActiveTopWindow only becomes non-null asynchronously, so wait
    // for it if necessary:
    let topwin;
    const toolkit = css.awt.Toolkit.create(context);
    function setUpTopWindow() {
        topwin = toolkit.getActiveTopWindow();
        if (topwin) {
            topwin.FullScreen = true;
            topwin.setMenuBar(null);
        }
    }
    toolkit.addTopWindowListener(
        zetajs.unoObject([css.awt.XTopWindowListener], {
            disposing(Source) {},
            windowOpened(e) {},
            windowClosing(e) {},
            windowClosed(e) {},
            windowMinimized(e) {},
            windowNormalized(e) {},
            windowActivated(e) {
                if (!topwin) {
                    setUpTopWindow();
                }
            },
            windowDeactivated(e) {},
        }));
    setUpTopWindow();

    // Turn off sidebar:
    dispatch('.uno:Sidebar');

    urls = {};
    button('bold', '.uno:Bold');
    button('italic', '.uno:Italic');
    button('underline', '.uno:Underline');

    zetajs.mainPort.onmessage = function (e) {
        switch (e.data.cmd) {
        case 'toggle':
            dispatch(urls[e.data.id]);
            break;
        default:
            throw Error('Unknonwn message command ' + e.data.cmd);
        }
    }
}

function button(id, url) {
    urls[id] = url;
    const urlObj = transformUrl(url);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
        disposing: function(source) {},
        statusChanged: function(state) {
            zetajs.mainPort.postMessage({cmd: 'state', id, state: state.State});
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

Module.zetajs.then(function(pZetajs) {
    // initializing zetajs environment
    zetajs = pZetajs;
    css = zetajs.uno.com.sun.star;
    // launching demo
    demo();
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
