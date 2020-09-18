var app = {};

app.name = function () {return chrome.runtime.getManifest().name};
app.version = function () {return chrome.runtime.getManifest().version};
app.short = function () {return chrome.runtime.getManifest().short_name};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};
app.tab = {"open": function (url) {chrome.tabs.create({"url": url, "active": true})}};

if (!navigator.webdriver) {
  chrome.runtime.setUninstallURL(app.homepage() + "?v=" + app.version() + "&type=uninstall", function () {});
  chrome.runtime.onInstalled.addListener(function (e) {
    chrome.management.getSelf(function (result) {
      if (result.installType === "normal") {
        window.setTimeout(function () {
          var previous = e.previousVersion !== undefined && e.previousVersion !== app.version();
          var doupdate = previous && parseInt((Date.now() - config.welcome.lastupdate) / (24 * 3600 * 1000)) > 45;
          if (e.reason === "install" || (e.reason === "update" && doupdate)) {
            var parameter = (e.previousVersion ? "&p=" + e.previousVersion : '') + "&type=" + e.reason;
            app.tab.open(app.homepage() + "?v=" + app.version() + parameter);
            config.welcome.lastupdate = Date.now();
          }
        }, 3000);
      }
    });
  });
}

app.contextmenu = (function () {
  var clicked;
  chrome.contextMenus.onClicked.addListener(function (e) {if (clicked) clicked(e)});
  /*  */
  return {
    "clicked": function (e) {clicked = e},
    "create": function () {
      chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({
          "id": "test.page",
          "contexts": ["browser_action"],
          "title": "What is my Fingerprint"
        });
        /*  */
        chrome.contextMenus.create({
          "type": "checkbox",
          "contexts": ["browser_action"],
          "title": "Desktop Notifications",
          "checked": config.notification.show
        });
      });
    }
  };
})();

app.storage = (function () {
  var objs = {};
  window.setTimeout(function () {
    chrome.storage.local.get(null, function (o) {
      objs = o;
      var script = document.createElement("script");
      script.src = "../common.js";
      document.body.appendChild(script);
    });
  }, 0);
  /*  */
  return {
    "read": function (id) {return objs[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      objs[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  }
})();

app.popup = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "popup-to-background") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data, tabId) {
      chrome.runtime.sendMessage({"path": "background-to-popup", "method": id, "data": data});
    }
  }
})();

(function(){
  "use strict";
  
  let scope;
  if ((typeof exports) !== "undefined"){
    scope = exports;
  }
  else {
    scope = require.register("./intercept", {});
  }
  
  const {changedFunctions, changedGetters, setRandomSupply} = require("./modifiedAPI");
  const randomSupplies = require("./randomSupplies");
  const logging = require("./logging");
  const settings = require("./settings");
  const extension = require("./extension");

  setRandomSupply(randomSupplies.nonPersistent);
  const apiNames = Object.keys(changedFunctions);
  let undef;
  function setRandomSupplyByType(type){
    switch (type){
      case "persistent":
        setRandomSupply(randomSupplies.persistent);
        break;
      case "constant":
        setRandomSupply(randomSupplies.constant);
        break;
      case "white":
        setRandomSupply(randomSupplies.white);
        break;
      default:
        setRandomSupply(randomSupplies.nonPersistent);
    }
  }
  settings.on("rng", function(){
    setRandomSupplyByType(settings.rng);
  });
  
  function getURL(windowToProcess){
    let href;
    try {
      href = windowToProcess.location.href;
    }
    catch (error){
      // unable to read location due to SOP
      // since we are not able to do anything in that case we can allow everything
      return "about:SOP";
    }
    if (!href || href === "about:blank"){
      if (windowToProcess !== windowToProcess.parent){
        return getURL(windowToProcess.parent);
      }
      else if (windowToProcess.opener){
        return getURL(windowToProcess.opener);
      }
    }
    return href;
  }
  const getAllFunctionObjects = function(windowToProcess, changedFunction){
    return (
      Array.isArray(changedFunction.object)?
        changedFunction.object:
        [changedFunction.object]
    ).map(function(name){
      if (name){
        const constructor = extension.getWrapped(windowToProcess)[name];
        if (constructor){
          return constructor.prototype;
        }
      }
      return false;
    }).concat(
      changedFunction.objectGetters?
        changedFunction.objectGetters.map(function(objectGetter){
          return objectGetter(extension.getWrapped(windowToProcess));
        }):
        []
    );
  };
  const forEachFunction = function(windowToProcess, callback){
    apiNames.forEach(function(name){
      const changedFunction = changedFunctions[name];
      if (changedFunction.name){
        name = changedFunction.name;
      }
      getAllFunctionObjects(windowToProcess, changedFunction).forEach(function(object){
        if (object){
          callback({name, object: object, changedFunction});
        }
      });
    });
  };
  const forEachGetter = function(windowToProcess, callback){
    changedGetters.forEach(function(changedGetter){
      const name = changedGetter.name;
      changedGetter.objectGetters.forEach(function(changedGetter){
        const object = changedGetter(extension.getWrapped(windowToProcess));
        if (object){
          callback({name, object, objectGetter: changedGetter});
        }
      });
    });
  };
  
  const forEach = function(windowToProcess, callback){
    forEachFunction(windowToProcess, callback);
    forEachGetter(windowToProcess, callback);
  };
  
  const doRealIntercept = function(windowToProcess, apis, state){
    if (!state.intercepted){
      scope.intercept({subject: windowToProcess}, apis);
      state.intercepted = true;
    }
  };
  const doPreIntercept = function(windowToProcess, apis, state){
    const forceLoad = true;
    const originalPropertyDescriptors = {};
    const undoPreIntercept = function(){
      if (state.preIntercepted){
        state.preIntercepted = false;
        forEach(windowToProcess, function({name, object}){
          const originalPropertyDescriptor = originalPropertyDescriptors[name].get(object);
          if (originalPropertyDescriptor){
            Object.defineProperty(
              object,
              name,
              originalPropertyDescriptor
            );
          }
        });
      }
    };

    var inject = function () {
  var config = {
    "random": {
      "value": function () {return Math.random()},
      "item": function (e) {
        var rand = e.length * config.random.value();
        return e[Math.floor(rand)];
      },
      "array": function (e) {
        var rand = config.random.item(e);
        return new Int32Array([rand, rand]);
      },
      "items": function (e, n) {
        var length = e.length;
        var result = new Array(n);
        var taken = new Array(length);
        if (n > length) n = length;
        //
        while (n--) {
          var i = Math.floor(config.random.value() * length);
          result[n] = e[i in taken ? taken[i] : i];
          taken[i] = --length in taken ? taken[length] : length;
        }
        //
        return result;
      }
    },
    "spoof": {
      "webgl": {
        "buffer": function (target) {
          const bufferData = target.prototype.bufferData;
          Object.defineProperty(target.prototype, "bufferData", {
            "value": function () {
              var index = Math.floor(config.random.value() * 10);
              var noise = 0.1 * config.random.value() * arguments[1][index];
              arguments[1][index] = arguments[1][index] + noise;
              window.top.postMessage("webgl-fingerprint-defender-alert", '*');
              //
              return bufferData.apply(this, arguments);
            }
          });
        },
        "parameter": function (target) {
          const getParameter = target.prototype.getParameter;
          Object.defineProperty(target.prototype, "getParameter", {
            "value": function () {
              var float32array = new Float32Array([1, 8192]);
              window.top.postMessage("webgl-fingerprint-defender-alert", '*');
              //
              if (arguments[0] === 3415) return 0;
              else if (arguments[0] === 3414) return 24;
              else if (arguments[0] === 35661) return config.random.items([128, 192, 256]);
              else if (arguments[0] === 3386) return config.random.array([8192, 16384, 32768]);
              else if (arguments[0] === 36349 || arguments[0] === 36347) return config.random.item([4096, 8192]);
              else if (arguments[0] === 34047 || arguments[0] === 34921) return config.random.items([2, 4, 8, 16]);
              else if (arguments[0] === 7937 || arguments[0] === 33901 || arguments[0] === 33902) return float32array;
              else if (arguments[0] === 34930 || arguments[0] === 36348 || arguments[0] === 35660) return config.random.item([16, 32, 64]);
              else if (arguments[0] === 34076 || arguments[0] === 34024 || arguments[0] === 3379) return config.random.item([16384, 32768]);
              else if (arguments[0] === 3413 || arguments[0] === 3412 || arguments[0] === 3411 || arguments[0] === 3410 || arguments[0] === 34852) return config.random.item([2, 4, 8, 16]);
              else return config.random.item([0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]);
              //
              return getParameter.apply(this, arguments);
            }
          });
        }
      }
    }
  };
  
    if (!state.preIntercepted){
      forEach(windowToProcess, function({name, object}){
        const map = originalPropertyDescriptors[name] || new WeakMap();
        originalPropertyDescriptors[name] = map;
        
        const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(object, name);
        if (!originalPropertyDescriptor){
          return;
        }
        
        map.set(object, originalPropertyDescriptor);
        const temp = class {
          [`get ${name}`](){
            if (forceLoad){
              logging.warning("force load the settings. Calling stack:", (new Error()).stack);
              undoPreIntercept();
              settings.forceLoad();
              doRealIntercept(windowToProcess, apis, state);
              const descriptor = Object.getOwnPropertyDescriptor(object, name);
              return descriptor.value || descriptor.get.call(this);
            }
            else {
              logging.notice("API blocked (%s)", name);
              const url = getURL(windowToProcess);
              if (!url){
                return undef;
              }
              const error = new Error();
              apis.notify({
                url,
                errorStack: error.stack,
                messageId: "preBlock",
                timestamp: new Date(),
                functionName: name,
                dataURL: false
              });
              return undef;
            }
          }
          [`set ${name}`](newValue){}
        }.prototype;
        Object.defineProperty(
          object,
          name,
          {
            enumerable: true,
            configurable: true,
            get: extension.exportFunctionWithName(temp[`get ${name}`], windowToProcess, `get ${name}`),
            set: extension.exportFunctionWithName(temp[`set ${name}`], windowToProcess, `set ${name}`)
          }
        );
      });
      state.preIntercepted = true;
    }
    return undoPreIntercept;
  };
  
  scope.preIntercept = function preIntercept({subject: windowToProcess}, apis){
    if (!settings.isStillDefault){
      logging.message("settings already loaded -> no need to pre intercept");
      scope.intercept({subject: windowToProcess}, apis);
    }
    else {
      logging.message("settings not loaded -> need to pre intercept");
      
      const state = {
        preIntercepted: false,
        intercepted: false
      };
      
      const undoPreIntercept = doPreIntercept(windowToProcess, apis, state);
      settings.onloaded(function(){
        undoPreIntercept();
        doRealIntercept(windowToProcess, apis, state);
      });
    }
  };

  function getDataURL(object, prefs){
    return (
      object &&
      prefs("storeImageForInspection") &&
      prefs("showNotifications")?
        (
          object instanceof HTMLCanvasElement?
            object.toDataURL():
            (
              object.canvas instanceof HTMLCanvasElement?
                object.canvas.toDataURL():
                false
            )
        ):
        false
    );
  }
  
  let extensionID = extension.extensionID;
  
  function generateChecker({
    name, changedFunction, siteStatus, original,
    window: windowToProcess, prefs, notify, checkStack, ask
  }){
    return function checker(callingDepth = 2){
      const errorStack = (new Error()).stack;
      
      try {
        // return original if the extension itself requested the function
        if (
          errorStack
            .split("\n", callingDepth + 2)[callingDepth + 1]
            .split("@", callingDepth + 1)[1]
            .startsWith(extensionID)
        ){
          return {allow: true, original, window: windowToProcess};
        }
      }
      catch (error) {
        // stack had an unknown form
      }
      if (checkStack(errorStack)){
        return {allow: true, original, window: windowToProcess};
      }
      const funcStatus = changedFunction.getStatus(this, siteStatus, prefs);
      
      const This = this;
      function notifyCallback(messageId){
        notify({
          url: getURL(windowToProcess),
          errorStack,
          messageId,
          timestamp: new Date(),
          functionName: name,
          api: changedFunction.api,
          dataURL: getDataURL(This, prefs)
        });
      }
      const protectedAPIFeatures = prefs("protectedAPIFeatures");
      if (
        funcStatus.active &&
        (
          !protectedAPIFeatures.hasOwnProperty(name + " @ " + changedFunction.api) ||
          protectedAPIFeatures[name + " @ " + changedFunction.api]
        )
      ){
        if (funcStatus.mode === "ask"){
          funcStatus.mode = ask({
            window: windowToProcess,
            type: changedFunction.type,
            api: changedFunction.api,
            canvas: this instanceof HTMLCanvasElement?
              this:
              (
                this &&
                (this.canvas instanceof HTMLCanvasElement)?
                  this.canvas:
                  false
              ),
            errorStack
          });
        }
        switch (funcStatus.mode){
          case "allow":
            return {allow: true, original, window: windowToProcess};
          case "fake":
            return {
              allow: "fake",
              prefs,
              notify: notifyCallback,
              window: windowToProcess,
              original
            };
          //case "block":
          default:
            return {allow: false, notify: notifyCallback};
        }
      }
      else {
        return {allow: true, original, window: windowToProcess};
      }
    };
  }
  
  function interceptFunctions(windowToProcess, siteStatus, {checkStack, ask, notify, prefs}){
    apiNames.forEach(function(name){
      const changedFunction = changedFunctions[name];
      if (changedFunction.name){
        name = changedFunction.name;
      }
      const functionStatus = changedFunction.getStatus(undefined, siteStatus, prefs);
      logging.verbose("status for", name, ":", functionStatus);
      if (!functionStatus.active) return;
      
      getAllFunctionObjects(windowToProcess, changedFunction).forEach(function(object){
        if (!object) return;
        
        const original = object[name];
        const checker = generateChecker({
          name, changedFunction, siteStatus, original,
          window: windowToProcess, prefs, checkStack, ask, notify
        });
        const descriptor = Object.getOwnPropertyDescriptor(object, name);
        if (!descriptor) return;
        const type = descriptor.hasOwnProperty("value")? "value": "get";
        let changed;
        if (type ==="value"){
          if (changedFunction.fakeGenerator){
            changed = extension.exportFunctionWithName(
              changedFunction.fakeGenerator(checker, original, windowToProcess),
              windowToProcess,
              original.name
            );
          }
          else {
            changed = null;
          }
        }
        else {
          changed = extension.exportFunctionWithName(function(){
            return extension.exportFunctionWithName(
              changedFunction.fakeGenerator(checker),
              windowToProcess,
              original.name
            );
          }, windowToProcess, descriptor.get.name);
        }
        extension.changeProperty(windowToProcess, changedFunction.api, {
          object, name, type, changed
        });
      });
    });
  }
  function interceptGetters(windowToProcess, siteStatus, {checkStack, ask, notify, prefs}){
    changedGetters.forEach(function(changedGetter){
      const name = changedGetter.name;
      const functionStatus = changedGetter.getStatus(undefined, siteStatus, prefs);
      logging.verbose("status for", changedGetter, ":", functionStatus);
      if (!functionStatus.active) return;
      
      changedGetter.objectGetters.forEach(function(objectGetter){
        const object = objectGetter(extension.getWrapped(windowToProcess));
        if (!object) return;
      
        const descriptor = Object.getOwnPropertyDescriptor(object, name);
        if (!descriptor) return;
        
        if (descriptor.hasOwnProperty("get")){
          const original = descriptor.get;
          const checker = generateChecker({
            name, changedFunction: changedGetter, siteStatus, original,
            window: windowToProcess, prefs, checkStack, ask, notify
          });
          const getter = changedGetter.getterGenerator(checker, original, windowToProcess);
          extension.changeProperty(windowToProcess, changedGetter.api,
            {
              object, name, type: "get",
              changed: extension.exportFunctionWithName(getter, windowToProcess, original.name)
            }
          );
          
          if (descriptor.hasOwnProperty("set") && descriptor.set && changedGetter.setterGenerator){
            const original = descriptor.set;
            const setter = changedGetter.setterGenerator(
              windowToProcess,
              original,
              prefs
            );
            extension.changeProperty(windowToProcess, changedGetter.api,
              {
                object, name, type: "set",
                changed: extension.exportFunctionWithName(setter, windowToProcess, original.name)
              }
            );
          }
          
        }
        else if (
          changedGetter.valueGenerator &&
          descriptor.hasOwnProperty("value")
        ){
          const protectedAPIFeatures = prefs("protectedAPIFeatures");
          if (
            protectedAPIFeatures.hasOwnProperty(name + " @ " + changedGetter.api) &&
            !protectedAPIFeatures[name + " @ " + changedGetter.api]
          ){
            return;
          }
          switch (functionStatus.mode){
            case "ask": case "block": case "fake":
              extension.changeProperty(windowToProcess, changedGetter.api, {
                object, name, type: "value",
                changed: changedGetter.valueGenerator({
                  mode: functionStatus.mode,
                  original: descriptor.value,
                  notify: function notifyCallback(messageId){
                    notify({
                      url: getURL(windowToProcess),
                      errorStack: (new Error()).stack,
                      messageId,
                      timestamp: new Date(),
                      functionName: name,
                      api: changedGetter.api
                    });
                  }
                })
              });
              break;
          }
        }
        else {
          logging.error("Try to fake non getter property:", changedGetter);
        }
      });
    });
  }
  scope.intercept = function intercept({subject: windowToProcess}, apis){
    const siteStatus = apis.check({url: getURL(windowToProcess)});
    logging.verbose("status for page", windowToProcess, siteStatus);
    if (siteStatus.mode !== "allow"){
      interceptFunctions(windowToProcess, siteStatus, apis);
      interceptGetters(windowToProcess, siteStatus, apis);
    }
  };
}());

app.content_script = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "page-to-background") {
          if (request.method === id) {
            tmp[id](request.data);
          }
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          chrome.tabs.sendMessage(tab.id, {"path": "background-to-page", "method": id, "data": data});
        });
      });
    }
  }
})();
