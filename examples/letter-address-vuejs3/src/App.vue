<!-- SPDX-License-Identifier: MIT -->
<script setup lang=ts>
import ControlBar from '@/components/ControlBar.vue';
</script>

<script lang=ts>
export default {
  mounted() {
    const config_js = document.createElement("script");
    config_js.src = "./config.js";
    document.body.appendChild(config_js);  // May fail. config.js is optional.
    const pre_soffice_js = document.createElement("script");
    pre_soffice_js.type = "module";
    pre_soffice_js.src = "./pre_soffice.js";
    pre_soffice_js.onload = function () {
      ControlBar.init_control_bar();
    }
    document.body.appendChild(pre_soffice_js);
  },
};
</script>

<template>
  <div id="app">
    <div class="container-fluid p-0" style="width:1150px; margin:auto;">
      <div class="row">
        <div class="col mt-3 mb-2">
          <h1>ZetaJS: Letter Address Vue.js-3</h1>
        </div>
      </div>
      <div class="row">
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="btnLetter" onclick="btnSwitchTab('letter')" type="button" role="tab"
              aria-controls="home-tab-pane" aria-selected="true" disabled>Editor</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="btnTable" onclick="btnSwitchTab('table')" type="button" role="tab"
              aria-controls="profile-tab-pane" aria-selected="false" disabled>Addresses</button>
          </li>
        </ul>
        <div class="tab-content p-1" id="tabContent">
          <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="btnLetter"
            tabindex="0">
            <div class="row">
              <!-- The ControlBar may extend horizontally if the selected font family has a long name. -->
              <ControlBar id="controlbar" class="mt-1 mb-1" />
              <div id="canvasCell" class="col-lg-9">
                <div class="canvas-container" onselectstart="event.preventDefault()">
                  <div id="loadingInfo" class="loading-info">
                    <div class="spinner"></div><br>
                    <h2>ZetaOffice is loading...</h2>
                  </div>
                  <canvas id="qtcanvas" contenteditable="true" oncontextmenu="event.preventDefault()"
                    onkeydown="event.preventDefault()" style="width:870px; height:500px; visibility:hidden;"
                    class="qt-canvas">
                    <!-- Qt requires the canvas to have the ID "qtcanvas". -->
                    <!-- The canvas *must not* have any border or padding, or mouse coords will be wrong. -->
                    <!-- An outline is fine though. -->
                  </canvas>
                </div>
              </div>
              <div id="controlCell" class="col-lg-3">
                <h4>Document</h4>
                <button class="btn btn-light btn-sm ms-2" id="btnUpload" onclick="btnUploadFunc()" disabled>
                  Upload new file</button>
                <button class="btn btn-light btn-sm ms-2" id="btnReload" onclick="btnReloadFunc()" disabled>
                  Reload file</button>
                <div id="addrNameCell">
                  <div class="d-flex justify-content-between">
                    <h4 class="mt-3">Recipient</h4>
                    <button class="btn btn-primary btn-sm mb-2 mt-3" id="btnInsert"
                      onclick="btnInsertFunc()" disabled>Insert Address</button>
                  </div>
                  <!-- size: Somehow needs about 3 rows more space when deployed on the website. -->
                  <select class="form-select" id="addrName" size="13" autofocus disabled></select>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>


<style>
.spinner {
  border: 16px solid #1F2937;
  /* ZetaOffice brand color */
  border-top: 16px solid #059669;
  /* ZetaOffice brand color */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  position: relative;
  left: 60px;
  /* adjust to center */
  animation: spin 2s linear 30;
  /* 60 seconds */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Disable dark mode. ControlBar doesn't work well with it. */
body {
  background-color: var(--background-color);
  color: var(--text-color);
}

.container {
  padding: 0;
}

.file-input {
  display: none;
}

.canvas-container {
  position: relative;
}

.loading-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.qt-canvas {
  border: 0px none;
  padding: 0;
  /*outline: 1px solid #cccccc;*/
}

#tabContent {
  border: 1px solid var(--bs-border-color);
  ;
  border-top: none;
}
</style>
