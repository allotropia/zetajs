// ATTENTION: Experimental code! Expect heavy API changes.



/**
 * Helper for code in the browsers main thread.
 * @beta
 */
export class ZetaHelperMain {
  static wasmUrls: Record<string, any> = {
    free: 'https://cdn.zetaoffice.net/zetaoffice_latest/',
    business: 'https://business-cdn.zetaoffice.net/zetaoffice_latest/',
  };

  canvas: HTMLElement;
  Module: any;
  threadJs: string | null;
  threadJsType = 'classic';
  soffice_base_url: string;
  /** zetajs thread communication */
  thrPort!: MessagePort;
  /** Emscripten Unix like virtual file system */
  FS!: any;


  /**
   * Use absolute URLs or URLs relative to the root HTML document (location.href).
   * @param threadJs - URL for JS code file running inside the office thread (web worker).
   * @param options.threadJsType - 'classic' or 'module' (ES2015)
   *   see: https://developer.mozilla.org/docs/Web/API/Worker/Worker#type
   * @param options.wasmPkg - Which WASM binaries to use. Possible options:
   *   'free', 'business', 'url:YOUR_CUSTOM_URL'
   * @param options.blockPageScroll - Don't scroll the HTML page while the cursor is above
   *   the canvas. (default: true)
   */
  constructor(
      threadJs: string | URL | null,
      options: {
        threadJsType: string | null,
        wasmPkg: string | null,  // default: 'free'
        blockPageScroll: boolean  // default: true
      }) {
    // Enable usage of LOWA builds with UI.
    const canvas = document.getElementById('qtcanvas')!;

    const thisFileUrl = import.meta.url;
    const modUrlDir = thisFileUrl.substring(0, thisFileUrl.length - 'zetaHelper.js'.length);

    if (threadJs) threadJs = (new URL(threadJs, location.href)).toString();

    const zetajsScriptSrc = modUrlDir + 'zeta.js';
    const zetajsScript = 'data:text/javascript;charset=UTF-8,import("' + zetajsScriptSrc + '");';
    const threadWrapScript = 'data:text/javascript;charset=UTF-8,' +
      'import("' + import.meta.url + '").then(m => {m.zetaHelperWrapThread();});';
    const wasmPkg = options.wasmPkg || 'free';
    let soffice_base_url = ZetaHelperMain.wasmUrls[wasmPkg] || ZetaHelperMain.wasmUrls['free'];
    if (wasmPkg?.substring(0,4) === 'url:') soffice_base_url = wasmPkg.substring(4, wasmPkg.length);
    if (soffice_base_url === '') soffice_base_url = './';
    soffice_base_url = (new URL(soffice_base_url, location.href)).toString();
    const Module: any = {
      canvas,
      // TODO: import only threadWrapScript.
      //       So import zeta.js on demand in the threads.
      //uno_scripts: [zetajsScript, threadWrapScript],
      uno_scripts: [threadWrapScript],
      locateFile: (path: string, prefix: string) => { return (prefix || soffice_base_url) + path; },
      modUrlDir,
    };
    Module.mainScriptUrlOrBlob = new Blob(
      ["importScripts('"+(new URL('soffice.js', soffice_base_url))+"');"],
      {type: 'text/javascript'});

    let lastDevicePixelRatio = window.devicePixelRatio;
    addEventListener('resize', () => {
      // Workaround to inform Qt5 about changed browser zoom.
      setTimeout(() => {
        if (lastDevicePixelRatio != -1) {
          if (lastDevicePixelRatio != window.devicePixelRatio) {
            lastDevicePixelRatio = -1;
            this.widthPxAdd(canvas.style, +1);
            window.dispatchEvent(new Event('resize'));
          }
        } else {
          lastDevicePixelRatio = window.devicePixelRatio
          this.widthPxAdd(canvas.style, -1);
          window.dispatchEvent(new Event('resize'));
        }
      }, 100);
    });

    // Scroll only the canvas while the mouse cursor is above it.
    if (options.blockPageScroll != false)
      canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
      }, {passive: false});

    (window as any).Module = Module;  // window.* is global
    this.canvas = canvas;
    this.Module = Module;
    this.threadJs = threadJs?.toString() || null;
    if (options.threadJsType === 'module') this.threadJsType = 'module';
    this.soffice_base_url = soffice_base_url;
  }


  start(app_init: () => void) {
    const zHM = this;
    const soffice_js = document.createElement("script");
    soffice_js.src = zHM.soffice_base_url + "soffice.js";
    // "onload" runs after the loaded script has run.
    soffice_js.onload = () => {
      console.log('zetaHelper: Configuring Module');
      zHM.Module.uno_main.then((pThrPort: MessagePort) => {
        zHM.thrPort = pThrPort;
        zHM.FS = (window as any).FS;
        zHM.thrPort.onmessage = (e: any) => {
          switch (e.data.cmd) {
          case 'ZetaHelper::thr_started':
            // Trigger resize of the embedded window to match the canvas size.
            // May somewhen be obsoleted by:
            //   https://gerrit.libreoffice.org/c/core/+/174040
            window.dispatchEvent(new Event('resize'));
            zHM.thrPort.postMessage({
              cmd: 'ZetaHelper::run_thr_script',
              threadJs: zHM.threadJs,
              threadJsType: zHM.threadJsType
            });
            app_init();
            break;
          default:
            throw Error('Unknown message command: ' + e.data.cmd);
          };
        }
      });
    };
    console.log('zetaHelper: Loading WASM binaries for ZetaJS from: ' + zHM.soffice_base_url);
    // Hint: The global objects "canvas" and "Module" must exist before the next line.
    document.body.appendChild(soffice_js);
  }

  private widthPxAdd(obj: CSSStyleDeclaration, value: number) {
    if (/\A\d+px\z/.test(obj.width)) {
      obj.width = parseInt(obj.width) + value + 'px';
    }
  }
}




/**
 * Initializes zetajs in the office thread (web worker).
 * Will be called by ZetaHelperMain.
 * NOT MEANT FOR DIRECT USE
 * @beta
 */
export function zetaHelperWrapThread() {
  const zJsModule = (globalThis as any).Module;
  import('./zeta.js').then((foobar: any) => {
    const zetajs = foobar.zetajs;
  //zJsModule.zetajs.then((zetajs: any) => {
  //foobar.then((zetajs: any) => {
    const port: MessagePort = zetajs.mainPort;
    port.onmessage = (e) => {
      switch (e.data.cmd) {
      case 'ZetaHelper::run_thr_script':
        port.onmessage = null;
        globalThis.zetajsStore = {zetajs, zJsModule};
        let threadJs = e.data.threadJs;
        if (threadJs) {
          if (e.data.threadJsType === 'module') {
            console.log('zetaHelper: Loading threadJs as module from: ' + threadJs);
            import(threadJs).then(module => {
              // Make exports of threadJs accessible for debugging.
              globalThis.zetajsStore.threadJsContext = module;
            });
          } else {  // classic
            console.log('zetaHelper: Loading threadJs as script from: ' + threadJs);
            importScripts(threadJs);
          }
        } else {
          console.log('zetaHelper: Office loaded. No threadJs given.');
        }
        break;
      default:
        throw Error('Unknown message command: ' + e.data.cmd);
      };
    }
    port.postMessage({
      cmd: 'ZetaHelper::thr_started'
    });
  //});

  });
}




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
    this.zetajs = globalThis.zetajsStore.zetajs;

    this.zJsModule = globalThis.zetajsStore.zJsModule;

    this.thrPort = this.zetajs.mainPort;
    this.css = this.zetajs.uno.com.sun.star;
    this.context = this.zetajs.getUnoComponentContext();
    this.desktop = this.css.frame.Desktop.create(this.context);
    this.config = this.css.configuration.ReadWriteAccess.create(this.context, 'en-US');
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
