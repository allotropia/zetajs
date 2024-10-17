/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';


// for debugging
let zetajs, css, context, desktop, bean_hidden, bean_overwrite, bean_pdf_export, e, from, to, doc;

Module.zetajs.then(function(argZetajs) {
    zetajs = argZetajs;
    css = zetajs.uno.com.sun.star;
    context = zetajs.getUnoComponentContext();
    desktop = css.frame.Desktop.create(context);

    bean_hidden = new css.beans.PropertyValue({Name: 'Hidden', Value: true});
    bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
    bean_pdf_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer_pdf_Export'});

    zetajs.mainPort.onmessage = function (eArg) {
        e = eArg;
        switch (e.data.cmd) {
        case 'convert':
            try {
                // Close old doc in advance. Keep doc open afterwards for debugging.
                if (doc !== undefined &&
                    doc.queryInterface(zetajs.type.interface(css.util.XCloseable))) {
                    doc.close(false);
                }
                from = e.data.from;
                to = e.data.to;
                doc = desktop.loadComponentFromURL('file://' + from, '_blank', 0, [bean_hidden]);
                doc.storeToURL( 'file://' + to, [bean_overwrite, bean_pdf_export]);
                zetajs.mainPort.postMessage({cmd: 'converted', name: e.data.name, from, to});
            } catch (e) {
                const exc = zetajs.catchUnoException(e);
                console.log('TODO', zetajs.getAnyType(exc), exc.Message);
            }
            break;
        default:
            throw Error('Unknonwn message command ' + e.data.cmd);
        }
    }

    zetajs.mainPort.postMessage({cmd: 'start'});
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
