/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

// Adapted sample code from <https://git.libreoffice.org/core>
// scripting/examples/python/TableSample.py:

Module.zetajs.then(function(zetajs) {
    const css = zetajs.uno.com.sun.star;
    const desktop = css.frame.Desktop.create(zetajs.getUnoComponentContext());
    const doc = desktop.loadComponentFromURL('private:factory/swriter', '_blank', 0, []);
    const text = doc.getText();
    const cursor = text.createTextCursor();
    const table = doc.createInstance('com.sun.star.text.TextTable');
    table.initialize(4, 4);
    text.insertTextContent(cursor, table, false);
    table.setPropertyValue('BackTransparent', false);
    table.setPropertyValue('BackColor', 13421823);
    const rows = table.getRows();
    const row = rows.getByIndex(0);
    row.setPropertyValue('BackTransparent', false);
    row.setPropertyValue('BackColor', 6710932);
    const insertTextIntoCell = function(cellName, text, color) {
        const tableText = table.getCellByName(cellName);
        const cursor = tableText.createTextCursor();
        cursor.setPropertyValue('CharColor', color);
        tableText.setString(text);
    };
    const textColor = 16777215;
    insertTextIntoCell('A1', 'FirstColumn', textColor);
    insertTextIntoCell('B1', 'SecondColumn', textColor);
    insertTextIntoCell('C1', 'ThirdColumn', textColor);
    insertTextIntoCell('D1', 'SUM', textColor);
    table.getCellByName('A2').setValue(22.5);
    table.getCellByName('B2').setValue(5615.3);
    table.getCellByName('C2').setValue(-2315.7);
    table.getCellByName('D2').setFormula('sum <A2:C2>');
    table.getCellByName('A3').setValue(21.5);
    table.getCellByName('B3').setValue(615.3);
    table.getCellByName('C3').setValue(-315.7);
    table.getCellByName('D3').setFormula('sum <A3:C3>');
    table.getCellByName('A4').setValue(121.5);
    table.getCellByName('B4').setValue(-615.3);
    table.getCellByName('C4').setValue(415.7);
    table.getCellByName('D4').setFormula('sum <A4:C4>');
    cursor.setPropertyValue('CharColor', 255);
    cursor.setPropertyValue('CharShadowed', true);
    text.insertControlCharacter(cursor, css.text.ControlCharacter.PARAGRAPH_BREAK, false);
    text.insertString(cursor, 'This is a colored Text - blue with shadow\n', false);
    text.insertControlCharacter(cursor, css.text.ControlCharacter.PARAGRAPH_BREAK, false);
    const textFrame = doc.createInstance('com.sun.star.text.TextFrame');
    textFrame.setSize({Width: 15000, Height: 400});
    textFrame.setPropertyValue('AnchorType', css.text.TextContentAnchorType.AS_CHARACTER);
    text.insertTextContent(cursor, textFrame, false);
    const textInTextFrame = textFrame.getText();
    const cursorInTextFrame = textInTextFrame.createTextCursor();
    textInTextFrame.insertString(
        cursorInTextFrame, 'The first line in the newly created text frame.', false);
    textInTextFrame.insertString(
        cursorInTextFrame, '\nWith this second line the height of the rame raises.', false);
    text.insertControlCharacter(cursor, css.text.ControlCharacter.PARAGRAPH_BREAK, false);
    cursor.setPropertyValue('CharColor', 65536);
    cursor.setPropertyValue('CharShadowed', false);
    text.insertString(cursor, 'That\'s all for now !!', false);
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
