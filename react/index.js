!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("react")):"function"==typeof define&&define.amd?define(["exports","react"],t):t(e["react-hyperactiv"]={},e.React)}(this,function(e,t){"use strict";const n=[],o=new WeakMap,r=function(e){return e&&"object"==typeof e},u=Array.isArray,c=function(e,t,n){Object.defineProperty(e,"__key",{value:t,enumerable:!1,configurable:!0}),Object.defineProperty(e,"__parent",{value:n,enumerable:!1,configurable:!0})},i={timeout:null,queue:new Set,process(){for(const e of i.queue)e();i.queue.clear(),i.timeout=null},enqueue(e){null===i.timeout&&(i.timeout=setTimeout(i.process,0)),i.queue.add(e)}},s=function(e,t={}){const{props:p=null,ignore:f=null,batch:a=!1,deep:l=!1,handler:d=null,bind:b=!1}=t;if(e.__observed)return e;o.set(e,new Map),l&&Object.entries(e).forEach(function([n,o]){r(o)&&(e[n]=s(o,t),d&&c(e[n],n,e))});const y=new Proxy(e,{get(t,r){if("__observed"===r)return!0;if((!p||p.includes(r))&&(!f||!f.includes(r))&&n.length){const t=o.get(e);t.has(r)||t.set(r,new Set),t.get(r).add(n[0])}return e[r]},set(b,m,_){const h=o.get(e);if((!u(e)||"length"!==m)&&e[m]===_)return!0;if(e[m]=l&&r(_)?s(_,t):_,d&&l&&r(_)&&c(e[m],m,e),d){const t=[m];let n=e;for(;n.__key&&n.__parent;)t.unshift(n.__key),n=n.__parent;d(t,_,y)}if((!p||p.includes(m))&&(!f||!f.includes(m))&&h.has(m)){const e=h.get(m);for(const t of e)t.__disposed?e.delete(t):t!==n[0]&&(a?i.enqueue(t):t())}return!0}});if(b){[...Object.getOwnPropertyNames(e),...Object.getPrototypeOf(e)?Object.getOwnPropertyNames(Object.getPrototypeOf(e)):[]].filter(t=>"constructor"!=t&&"function"==typeof e[t]).forEach(t=>e[t]=e[t].bind(y))}return y};var p={observe:s,computed:function(e,{autoRun:t=!0,callback:o=null,bind:r=null}={}){const u=new Proxy(e,{apply(e,t,c){const i=function(i=null){n.unshift(o||u);const s=i?i():e.apply(r||t,c);return n.shift(),s};return c.push({computeAsync:function(e){return i(e)}}),i()}});return t&&u(),u},dispose:function(e){return e.__disposed=!0}};const{observe:f,computed:a,dispose:l}=p,d=e=>(class extends t.PureComponent{constructor(t,n){super(t,n),this.wrap=a(e,{autoRun:!1,callback:this.forceUpdate.bind(this)})}render(){return this.wrap(this.props)}componentWillUnmount(){l(this.wrap)}});var b;e.watch=(e=>e.prototype.render?(b=e,new Proxy(b,{construct:function(e,t){const n=new e(...t);n.forceUpdate=n.forceUpdate.bind(n);const o="function"==typeof n.componentWillUnmount&&n.componentWillUnmount.bind(n)();return n.componentWillUnmount=function(...e){l(n.forceUpdate),o&&o(...e)},new Proxy(n,{get:function(e,t){return"render"===t?a(e.render.bind(e),{autoRun:!1,callback:n.forceUpdate}):e[t]}})}})):d(e)),e.store=(e=>f(e,{deep:!0})),Object.defineProperty(e,"__esModule",{value:!0})});
