import {zetajs} from  "./zeta.js";

/**
 * Helper for inside the office thread (web worker).
 * @beta
 */
export class ZetaHelperThread {
  config: any;
  context: any;
  /** com.sun.star */
  css: any;
  desktop: any;
  thrPort: MessagePort;
  zetajs: any;
  zJsModule: any;


  constructor() {
    //this.zetajs = globalThis.zetajsStore.zetajs;
    //this.zetajs = import('./zeta.js').then((foobar) => {
    //const zetajs = foobar.zetajs;
    this.zetajs = zetajs;

    //this.zJsModule = globalThis.zetajsStore.zJsModule;

    this.thrPort = this.zetajs.mainPort;
    this.css = this.zetajs.uno.com.sun.star;
    this.context = this.zetajs.getUnoComponentContext();
    this.desktop = this.css.frame.Desktop.create(this.context);
    this.config = this.css.configuration.ReadWriteAccess.create(this.context, 'en-US');

    //});
  }


  /**
   * Turn off toolbars.
   * @param officeModules - ["Base", "Calc", "Draw", "Impress", "Math", "Writer"];
   */
  configDisableToolbars(officeModules: string[]) {
    for (const mod of officeModules) {
      const modName = "/org.openoffice.Office.UI." + mod + "WindowState/UIElements/States";
      const uielems = this.config.getByHierarchicalName(modName);
      for (const i of uielems.getElementNames()) {
        if (i.startsWith("private:resource/toolbar/")) {
          const uielem = uielems.getByName(i);  // SLOW OPERATION
          if (uielem.getByName('Visible')) {
            uielem.setPropertyValue('Visible', false);
          }
        }
      }
    }
    this.config.commitChanges();
  }

  /**
   * @param unoUrl - string following ".uno:" (e.g. "Bold")
   */
  transformUrl(unoUrl: string) {
    const ioparam = {val: new this.css.util.URL({Complete: '.uno:' + unoUrl})};
    this.css.util.URLTransformer.create(this.context).parseStrict(ioparam);
    return ioparam.val;
  }

  queryDispatch(ctrl: any, urlObj: any) {
    return ctrl.queryDispatch(urlObj, '_self', 0);
  }

  dispatch(ctrl: any, unoUrl: string, params: any[] = []) {
    const urlObj = this.transformUrl(unoUrl);
    this.queryDispatch(ctrl, urlObj).dispatch(urlObj, params);
  }
}