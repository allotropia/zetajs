/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

// Adapted sample code from <https://git.libreoffice.org/core> static/README.wasm.md:

Module.zetajs.then(function(zetajs) {
    function getTextDocument() {
        const css = zetajs.uno.com.sun.star;
        const desktop = css.frame.Desktop.create(zetajs.getUnoComponentContext());
        let xModel = desktop.getCurrentFrame().getController().getModel();
        if (!xModel?.queryInterface(zetajs.type.interface(css.text.XTextDocument))) {
            xModel = desktop.loadComponentFromURL(
                'file:///android/default-document/example.odt', '_default', 0, []);
        }
        return xModel;
    };
    {
        const xModel = getTextDocument();
        const xText = xModel.getText();
        const xTextCursor = xText.createTextCursor();
        xTextCursor.setString("string here!");
    }
    {
        const xModel = getTextDocument();
        const xText = xModel.getText();
        const xParaEnumeration = xText.createEnumeration();
        for (const xParagraph of xParaEnumeration) {
            const color = Math.floor(Math.random() * 0xFFFFFF);
            xParagraph.setPropertyValue("CharColor", color);
        }
    }
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
