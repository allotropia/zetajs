<!-- SPDX-License-Identifier: MIT -->
<script setup lang=ts>
  import ControlBar from '@/components/ControlBar.vue';
  import Ping from 'ping.js';
  import zetajs from 'zetajs';
</script>

<script lang=ts>
  export default {
    mounted() {
      const config_js = document.createElement("script");
      config_js.src = "./config.js";
      document.body.appendChild(config_js);  // May fail. config.js is optional.
      const pre_soffice_js = document.createElement("script");
      pre_soffice_js.src = "./pre_soffice.js";
      pre_soffice_js.onload = function() {
        PingModule = Ping;  // pass Ping module to plain JS
        ControlBar.init_control_bar();
      }
      document.body.appendChild(pre_soffice_js);
    },
  };
</script>

<template>
  <div id="app">
    <table style="width:1150px; border-spacing: 10px;">
      <tr>
        <td>
          <div><h1>ZetaJS Ping Tool (Calc Demo with Vue.js-3)</h1></div>
          <ControlBar/>
        </td>
      </tr>
      <tr>
        <td>
          <div onselectstart="event.preventDefault()" style="position: relative">
            <!--  position: Makes the loading animation overlay the canvas.
                    Needs a surrounding table with fixed width to work properly.
                  onselectstart: Prevents accidently selecting / highlighting the canvas.
                    Must be set on the surrounding HTML element. (tested in Firefox-128) -->
            <div id="loadingInfo"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
              <div class="spinner"></div><br>
              <h2>ZetaOffice is loading...</h2>
            </div>
            <canvas
              id="qtcanvas" contenteditable="true"
              oncontextmenu="event.preventDefault()" onkeydown="event.preventDefault()"
              style="border: 0px none; padding: 0; outline: 1px solid #cccccc; width:900px; height:450px;">
              <!-- QT requires the canvas to have the ID "qtcanvas". -->
              <!-- The canvas *must not* have any border or padding, or mouse coords will be wrong. -->
              <!-- An outline is fine though. -->
            </canvas>
          </div>
        </td>
        <td style="vertical-align: top; width:250px">
          <div>
            <button onclick="btnPing()">Ping</button>&nbsp;
              <input type="text" id="ping_target" name="ping_target" value="https://zetaoffice.net/">
          </div>
          <div>
            <span id="ping_section">Loading ping tool...</span>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>


<style>
  .spinner {
    border: 16px solid #1F2937; /* ZetaOffice brand color */
    border-top: 16px solid #059669; /* ZetaOffice brand color */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    position: relative;
    left: 60px;  /* adjust to center */
    animation: spin 2s linear 30; /* 60 seconds */
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Disable dark mode. ControlBar doesn't work well with it. */
  body {
    background-color: var(--background-color);
    color: var(--text-color);
  }
</style>
