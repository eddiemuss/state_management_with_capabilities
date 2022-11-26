// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/policy_helper.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleStateWithCapability = void 0;
// That could be behind a gem like pundit
// I think it would be possible to make that Type aggnostic but it will loose reability.
var policyByAction = function policyByAction(action) {
  return {
    mark_as_treated: "can_mark_as_treated",
    mark_as_untreated: "can_mark_as_untreated",
    mark_as_to_finalize: "can_mark_as_to_finalize"
  }[action];
};
var wrapPolicyAroundFunctionCall = function wrapPolicyAroundFunctionCall(policy) {
  return {
    apply: function apply(target) {
      if (policy()) {
        return target();
      }
      return {
        success: false,
        reason: "Not Authorized"
      };
    }
  };
};
/**
 * This function will wrap each method incation of it's target class
 * with it's corresponding policy.
 * mark_as_treated with be wrapped with can_mark_as_treated.
 *
 * That should simulate the behaviour from pundit and a decorator pattern.
 * @param capability
 */
var handleStateWithCapability = function handleStateWithCapability(capability) {
  return {
    get: function get(target, action) {
      return new Proxy(target[action], wrapPolicyAroundFunctionCall(capability[policyByAction(action)]));
    }
  };
};
exports.handleStateWithCapability = handleStateWithCapability;
},{}],"src/index.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };
    return _extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    _extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
Object.defineProperty(exports, "__esModule", {
  value: true
});
var policy_helper_1 = require("./policy_helper");
/**
 * Defines which actions are general possible without thinking about
 * this users have access to particular state.
 */
var State = /** @class */function () {
  function State() {}
  State.prototype.mark_as_untreated = function () {
    return {
      success: false,
      reason: "Not implemented"
    };
  };
  State.prototype.mark_as_treated = function () {
    return {
      success: false,
      reason: "Not implemented"
    };
  };
  State.prototype.mark_as_to_finalize = function () {
    return {
      success: false,
      reason: "Not implemented"
    };
  };
  return State;
}();
var Treated = /** @class */function (_super) {
  __extends(Treated, _super);
  function Treated() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  return Treated;
}(State);
var Untreated = /** @class */function (_super) {
  __extends(Untreated, _super);
  function Untreated() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Untreated.prototype.mark_as_treated = function () {
    return {
      success: true,
      new_state: "treated"
    };
  };
  Untreated.prototype.mark_as_to_finalize = function () {
    return {
      success: true,
      new_state: "to_finalize"
    };
  };
  return Untreated;
}(State);
var ToFinalize = /** @class */function (_super) {
  __extends(ToFinalize, _super);
  function ToFinalize() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  ToFinalize.prototype.mark_as_treated = function () {
    return {
      success: true,
      new_state: "treated"
    };
  };
  ToFinalize.prototype.mark_as_untreated = function () {
    return {
      success: true,
      new_state: "untreated"
    };
  };
  return ToFinalize;
}(State);
/**
 * Defines which actions are allowed for this user without
 * knowing anything about what the action does.
 *
 * It only has to implement based on the actions the polices.
 * I got inspired by pundit :)
 */
var Capabilities = /** @class */function () {
  function Capabilities() {}
  Capabilities.prototype.can_mark_as_treated = function () {
    return false;
  };
  Capabilities.prototype.can_mark_as_untreated = function () {
    return false;
  };
  Capabilities.prototype.can_mark_as_to_finalize = function () {
    return false;
  };
  return Capabilities;
}();
var DoctorCapability = /** @class */function (_super) {
  __extends(DoctorCapability, _super);
  function DoctorCapability() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  DoctorCapability.prototype.can_mark_as_treated = function () {
    return true;
  };
  DoctorCapability.prototype.can_mark_as_untreated = function () {
    return true;
  };
  return DoctorCapability;
}(Capabilities);
var SecretaryCapability = /** @class */function (_super) {
  __extends(SecretaryCapability, _super);
  function SecretaryCapability() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  SecretaryCapability.prototype.can_mark_as_treated = function () {
    return true;
  };
  SecretaryCapability.prototype.can_mark_as_to_finalize = function () {
    return true;
  };
  return SecretaryCapability;
}(Capabilities);
/**
 * This should be the Interface for the request model.
 * It's only job is the define based on the state input 'treated' | 'untreated'
 * the correct state object and combines it with the capability.
 * Which capability is not important for the class.
 */
var ActionTransition = /** @class */function () {
  function ActionTransition() {
    this.capability = new Capabilities();
  }
  ActionTransition.prototype.mark_as_treated = function () {
    return this.get_allowed_state().mark_as_treated();
  };
  ActionTransition.prototype.mark_as_untreated = function () {
    return this.get_allowed_state().mark_as_untreated();
  };
  ActionTransition.prototype.mark_as_to_finalize = function () {
    return this.get_allowed_state().mark_as_to_finalize();
  };
  /**
   * This method should be used to authorized
   * any action with a correct capability.
   *
   * It should not be reimplemented or overwritten
   * @param capability
   */
  ActionTransition.prototype.access_with = function (capability) {
    this.capability = capability;
    return this;
  };
  ActionTransition.prototype.get_allowed_state = function () {
    if (this.state === "treated") {
      return new Proxy(new Treated(), (0, policy_helper_1.handleStateWithCapability)(this.capability));
    }
    if (this.state === "to_finalize") {
      return new Proxy(new ToFinalize(), (0, policy_helper_1.handleStateWithCapability)(this.capability));
    }
    return new Proxy(new Untreated(), (0, policy_helper_1.handleStateWithCapability)(this.capability));
  };
  return ActionTransition;
}();
// Don't worry about that class normally this is handled by active record
var PatientRequestEntry = /** @class */function (_super) {
  __extends(PatientRequestEntry, _super);
  function PatientRequestEntry(loaded_state) {
    var _this = _super.call(this) || this;
    _this.state = "untreated";
    _this.state = loaded_state;
    return _this;
  }
  PatientRequestEntry.prototype.set_state = function (state) {
    this.state = state;
    return this; // That makes method chaining possible.
  };

  return PatientRequestEntry;
}(ActionTransition);
// First test!
// Load a treated request from DB (Thanks to active record):
var request = new PatientRequestEntry("treated");
// access mark as untreated from request object
console.log("Treated request with no capability calls action mark_as_untreated", request.mark_as_untreated()); // By default it will be not authorized
// create a doctor capability (Idearly we would get that from an access service)
var doctorCapability = new DoctorCapability();
// Let's perform mark as untreated with a doctor access
console.log("calls action mark_as_untreated with doctor capability on an treated request", request.access_with(doctorCapability).mark_as_untreated()); // You can see it's not implemented yet.
// Let us implemented!
// Go for that into the state for treated and add the functionality mark_as_untreated.
// After implementing the function call mark_as_untreated again. Look that we only needed to change one part.
// We just added new functionallity without huge effort. (Open/closed principal)
// console.log(request.access_with(doctorCapability).mark_as_untreated());
console.log("--- Looping over all possible combinations ---");
// Let us loop over all the different states, actions, and capabilities to see how they are behaving when calling.
var secretaryCapability = new SecretaryCapability();
var capabilities = [secretaryCapability, doctorCapability];
var states = ["treated", "untreated", "to_finalize"];
var actions = ["mark_as_treated", "mark_as_untreated", "mark_as_to_finalize"];
capabilities.forEach(function (capability) {
  actions.forEach(function (action) {
    states.forEach(function (state) {
      console.log(capability.constructor.name + " > " + action + " - " + state, request.set_state(state).access_with(capability)[action]());
    });
  });
});
},{"./policy_helper":"src/policy_helper.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "39205" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.ts"], null)
//# sourceMappingURL=/src.f10117fe.js.map