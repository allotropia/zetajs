/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

'use strict';

// IMPORTANT:
// Set base URL to the soffice.* files.
// Use an empty string if those files are in the same directory.
let soffice_base_url = 'https://cdn.zetaoffice.net/zetaoffice_latest/';
try {
  soffice_base_url = config_soffice_base_url; // May fail. config.js is optional.
} catch {}


let thrPort;     // zetajs thread communication
let tbDataJs;    // toolbar dataset passed from vue.js for plain JS
let PingModule;  // Ping module passed from vue.js for plain JS

const loadingInfo = document.getElementById('loadingInfo');
const canvas = document.getElementById('qtcanvas');
const pingSection = document.getElementById("ping_section");
const pingTarget = document.getElementById("ping_target");


// Debugging note:
// Switch the web worker in the browsers debug tab to debug code inside uno_scripts.
var Module = {
  canvas,
  uno_scripts: ['zeta.js', './office_thread.js'],
  locateFile: function(path, prefix) { return (prefix || soffice_base_url) + path; },
};
if (soffice_base_url !== '') {
  // Must not be set when soffice.js is in the same directory.
  Module.mainScriptUrlOrBlob = new Blob(
    ["importScripts('"+soffice_base_url+"soffice.js');"], {type: 'text/javascript'});
}


function jsPassCtrlBar(pTbDataJs) {
  tbDataJs = pTbDataJs;
  console.log('PLUS: assigned tbDataJs');
}

function toggleFormatting(id) {
  setToolbarActive(id, !tbDataJs.active[id]);
  thrPort.postMessage({cmd: 'toggle', id});
  // Give focus to the LO canvas to avoid issues with
  // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is
  // undone when clicking into non-empty document" when the user would need to click
  // into the canvas to give back focus to it:
  canvas.focus();
}

function setToolbarActive(id, value) {
  tbDataJs.active[id] = value;
  // Need to set "active" on "tbDataJs" to trigger an UI update.
  tbDataJs.active = tbDataJs.active;
}

let dbgPingData;
function pingResult(url, err, data) {
  dbgPingData = {data, err};
  const hostname = (new URL(url)).hostname;
  let output = data;
  // If /favicon.ico can't be loaded the result still represents the response time.
  if (err) output = hostname + ": " + output + " " + err;
  console.log(output);
  if (urls_ary_i === 0) pingSection.innerHTML = "";
  pingSection.innerHTML = pingSection.innerHTML + hostname + ": " + data + "<br>";
  thrPort.postMessage({cmd: 'ping_result', id:{url, data} });
}

let pingInst;
const urls_ary = ["https://documentfoundation.org/", "https://ip4.me/", "https://allotropia.de/"];
let urls_ary_i = 0;
function pingExamples(err, data) {
  let url = urls_ary[urls_ary_i];
  pingResult(url, err, data);
  url = urls_ary[++urls_ary_i];
  if (typeof url !== 'undefined') {
    setTimeout(function() {  // make the demo look more interesting ;-)
      pingInst.ping(url, function(err_rec, data_rec) {
        pingExamples(err_rec, data_rec);
      });
    }, 1000);  // milliseconds
  }
}

function btnPing() {
  // Using Ping callback interface.
  const url = pingTarget.value;
  pingInst.ping(url, function(err, data) {
    pingResult(url, err, data);
  });
}
pingTarget.addEventListener ("keyup", (evt) => {
  if(evt.key === 'Enter') {
    btnPing();
  }
});


async function get_calc_ping_example_ods() {
  const response = await fetch("./calc_ping_example.ods");
  return response.arrayBuffer();
}
let calc_ping_example_ods;


const soffice_js = document.createElement("script");
soffice_js.src = soffice_base_url + "soffice.js";
// "onload" runs after the loaded script has run.
soffice_js.onload = function() {
  console.log('PLUS: Configuring Module');
  Module.uno_main.then(function(pThrPort) {
    // Should run after App.vue has set PingModule but before demo().
    // 'Cross-Origin-Embedder-Policy': Ping seems to work with 'require-corp' without
    //   acutally having CORP on foreign origins.
    //   Also 'credentialless' isn't supported by Safari-18 as of 2024-09.
    pingInst = new PingModule();

    thrPort = pThrPort;
    thrPort.onmessage = function(e) {
      switch (e.data.cmd) {
      case 'enable':
        setToolbarActive(e.data.id, true);
        break;
      case 'state':
        setToolbarActive(e.data.id, e.data.state);
        break;
      case 'ready':
        loadingInfo.style.display = 'none';
        // Trigger resize of the embedded window to match the canvas size.
        // May somewhen be obsoleted by:
        //   https://gerrit.libreoffice.org/c/core/+/174040
        window.dispatchEvent(new Event('resize'));
        // Using Ping callback interface.
        pingInst.ping(urls_ary[urls_ary_i], function() {
          setTimeout(function() {  // small delay to make the demo more interesting
            // Continue after first ping, which is often exceptionally slow.
            pingInst.ping(urls_ary[urls_ary_i], function(err, data) {
              pingExamples(err, data);
            });
          }, 1000);  // milliseconds
        });
        break;
      default:
        throw Error('Unknown message command ' + e.data.cmd);
      }
    };

    get_calc_ping_example_ods().then(function(aryBuf) {
      calc_ping_example_ods = aryBuf;
      FS.writeFile('/tmp/calc_ping_example.ods', new Uint8Array(calc_ping_example_ods));
    });
  });
};
console.log('Loading WASM binaries for ZetaJS from: ' + soffice_base_url);
// Hint: The global objects "canvas" and "Module" must exist before the next line.
document.body.appendChild(soffice_js);

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
