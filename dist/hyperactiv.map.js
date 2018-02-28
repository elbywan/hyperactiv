!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.hyperactiv=t()}(this,function(){"use strict";const e=[],t=new WeakMap,n=function(e){return e&&"object"==typeof e&&!(e instanceof Date)},r=Array.isArray,o=function(e,t,r,u){Object.defineProperty(e,"__key",{value:t,enumerable:!1,configurable:!0}),Object.defineProperty(e,"__parent",{value:r,enumerable:!1,configurable:!0}),u&&Object.entries(e).forEach(function([t,r]){!n(r)||r.__key&&r.__parent||o(e[t],t,e)})},u={timeout:null,queue:new Set,process(){for(const e of u.queue)e();u.queue.clear(),u.timeout=null},enqueue(e){null===u.timeout&&(u.timeout=setTimeout(u.process,0)),u.queue.add(e)}},c=function(t,{autoRun:n=!0,callback:r=null,bind:o=null}={}){const u=new Proxy(t,{apply(t,n,c){const s=function(s=null){e.unshift(r||u);const i=s?s():t.apply(o||n,c);return e.shift(),i};return c.push({computeAsync:function(e){return s(e)}}),s()}});return n&&u(),u},s=function(e){return e.__disposed=!0},i=function(c,s={}){const{props:l=null,ignore:a=null,batch:d=!1,deep:f=!1,bubble:p=null,bind:_=!1}=s;if(c.__observed)return c;t.set(c,new Map),f&&Object.entries(c).forEach(function([e,t]){n(t)&&(c[e]=i(t,s),p&&o(c[e],e,c))});const b=new Proxy(c,{get(n,r){if("__observed"===r)return!0;if((!l||l.includes(r))&&(!a||!a.includes(r))&&e.length){const n=t.get(c);n.has(r)||n.set(r,new Set),n.get(r).add(e[0])}return c[r]},set(p,_,y){if("__handler"===_)return Object.defineProperty(c,"__handler",{value:y,enumerable:!1,configurable:!0}),!0;const h=t.get(c);if((!r(c)||"length"!==_)&&c[_]===y)return!0;const m=c[_];if(n(m)&&(delete m.__key,delete m.__parent),c[_]=f&&n(y)?i(y,s):y,c.__handler||c.__parent){f&&n(y)&&o(c[_],_,c,f);const e=[_];let t=c;for(;t&&(!t.__handler||!1!==t.__handler(e,y,m,b));)t.__key&&t.__parent?(e.unshift(t.__key),t=t.__parent):t=null}if((!l||l.includes(_))&&(!a||!a.includes(_))&&h.has(_)){const t=h.get(_);for(const n of t)n.__disposed?t.delete(n):n!==e[0]&&(d?u.enqueue(n):n())}return!0},deleteProperty(e,t){const r=e[t];return n(r)&&(delete r.__key,delete r.__parent),delete e[t],!0}});if(_){[...Object.getOwnPropertyNames(c),...Object.getPrototypeOf(c)&&["String","Number","Object","Array","Boolean","Date"].indexOf(Object.getPrototypeOf(c).constructor.name)<0?Object.getOwnPropertyNames(Object.getPrototypeOf(c)):[]].filter(e=>"constructor"!=e&&"function"==typeof c[e]).forEach(e=>c[e]=c[e].bind(b))}return b};return{observe:i,computed:c,dispose:s,Observable:e=>(class extends e{constructor(e,t){super();const n=i(e||{},t||{deep:!0,batch:!0});return new Proxy(this,{set:(e,t,r)=>("function"==typeof r?this[t]=r:(n[t]=r,void 0===this[t]&&Object.defineProperty(this,t,{get:()=>n[t],enumerable:!0,configurable:!0})),!0),deleteProperty:(e,t)=>(delete n[t],delete e[t],!0)})}}),Computable:e=>(class extends e{constructor(){super(),Object.defineProperty(this,"__computed",{value:[],enumerable:!1})}computed(e){this.__computed.push(c(e))}dispose(){for(;this.__computed.length;)s(this.__computed.pop())}})}});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHlwZXJhY3Rpdi5tYXAuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjb21wdXRlZFN0YWNrID0gW11cbmNvbnN0IG9ic2VydmVyc01hcCA9IG5ldyBXZWFrTWFwKClcblxuLyogVG9vbHMgKi9cblxuY29uc3QgaXNPYmogPSBmdW5jdGlvbihvKSB7IHJldHVybiBvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiAhKG8gaW5zdGFuY2VvZiBEYXRlKSB9XG5jb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxuY29uc3QgZGVmaW5lQnViYmxpbmdQcm9wZXJ0aWVzID0gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHBhcmVudCwgZGVlcCkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsICdfX2tleScsIHsgdmFsdWU6IGtleSwgZW51bWVyYWJsZTogZmFsc2UsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsICdfX3BhcmVudCcsIHsgdmFsdWU6IHBhcmVudCwgZW51bWVyYWJsZTogZmFsc2UsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KVxuICAgIGRlZXAgJiYgT2JqZWN0LmVudHJpZXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uKFtrZXksIHZhbF0pIHtcbiAgICAgICAgaWYoaXNPYmoodmFsKSAmJiAoIXZhbC5fX2tleSB8fCAhdmFsLl9fcGFyZW50KSkgZGVmaW5lQnViYmxpbmdQcm9wZXJ0aWVzKG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICB9KVxufVxuXG5jb25zdCBiYXRjaGVyID0ge1xuICAgIHRpbWVvdXQ6IG51bGwsXG4gICAgcXVldWU6IG5ldyBTZXQoKSxcbiAgICBwcm9jZXNzKCkge1xuICAgICAgICBmb3IoY29uc3QgdGFzayBvZiBiYXRjaGVyLnF1ZXVlKSB0YXNrKClcbiAgICAgICAgYmF0Y2hlci5xdWV1ZS5jbGVhcigpXG4gICAgICAgIGJhdGNoZXIudGltZW91dCA9IG51bGxcbiAgICB9LFxuICAgIGVucXVldWUodGFzaykge1xuICAgICAgICBpZihiYXRjaGVyLnRpbWVvdXQgPT09IG51bGwpXG4gICAgICAgICAgICBiYXRjaGVyLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGJhdGNoZXIucHJvY2VzcywgMClcbiAgICAgICAgYmF0Y2hlci5xdWV1ZS5hZGQodGFzaylcbiAgICB9XG59XG5cbi8qIENvbXB1dGVkICovXG5cbmNvbnN0IGNvbXB1dGVkID0gZnVuY3Rpb24oZnVuLCB7IGF1dG9SdW4gPSB0cnVlLCBjYWxsYmFjayA9IG51bGwsIGJpbmQgPSBudWxsIH0gPSB7fSkge1xuICAgIC8vIFByb3hpZnkgdGhlIGZ1bmN0aW9uIGluIG9yZGVyIHRvIGludGVyY2VwdCB0aGUgY2FsbHNcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eShmdW4sIHtcbiAgICAgICAgYXBwbHkodGFyZ2V0LCB0aGlzQXJnLCBhcmdzTGlzdCkge1xuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIGZ1bmN0aW9uIHdoaWNoIGlzIGJlaW5nIGNvbXB1dGVkIGluc2lkZSBhIHN0YWNrXG4gICAgICAgICAgICBjb25zdCBwZXJmb3JtQ29tcHV0YXRpb24gPSBmdW5jdGlvbihmdW4gPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29tcHV0ZWRTdGFjay51bnNoaWZ0KGNhbGxiYWNrIHx8IHByb3h5KVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGZ1biA/IGZ1bigpIDogdGFyZ2V0LmFwcGx5KGJpbmQgfHwgdGhpc0FyZywgYXJnc0xpc3QpXG4gICAgICAgICAgICAgICAgY29tcHV0ZWRTdGFjay5zaGlmdCgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbmplY3QgdGhlIGNvbXB1dGVBc3luYyBhcmd1bWVudCB3aGljaCBpcyB1c2VkIHRvIG1hbnVhbGx5IGRlY2xhcmUgd2hlbiB0aGUgY29tcHV0YXRpb24gdGFrZXMgcGFydFxuICAgICAgICAgICAgYXJnc0xpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgY29tcHV0ZUFzeW5jOiBmdW5jdGlvbih0YXJnZXQpIHsgcmV0dXJuIHBlcmZvcm1Db21wdXRhdGlvbih0YXJnZXQpIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJldHVybiBwZXJmb3JtQ29tcHV0YXRpb24oKVxuICAgICAgICB9XG4gICAgfSlcbiAgICAvLyBJZiBhdXRvUnVuLCB0aGVuIGNhbGwgdGhlIGZ1bmN0aW9uIGF0IG9uY2VcbiAgICBpZihhdXRvUnVuKSBwcm94eSgpXG4gICAgcmV0dXJuIHByb3h5XG59XG5cbi8qIERpc3Bvc2UgKi9cblxuLy8gVGhlIGRpc3Bvc2VkIGZsYWcgd2hpY2ggaXMgdXNlZCB0byByZW1vdmUgYSBjb21wdXRlZCBmdW5jdGlvbiByZWZlcmVuY2UgcG9pbnRlclxuY29uc3QgZGlzcG9zZSA9IGZ1bmN0aW9uKF8pIHsgcmV0dXJuIF8uX19kaXNwb3NlZCA9IHRydWUgfVxuXG4vKiBPYnNlcnZlICovXG5cbmNvbnN0IG9ic2VydmUgPSBmdW5jdGlvbihvYmosIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgcHJvcHMgPSBudWxsLCBpZ25vcmUgPSBudWxsLCBiYXRjaCA9IGZhbHNlLCBkZWVwID0gZmFsc2UsIGJ1YmJsZSA9IG51bGwsIGJpbmQgPSBmYWxzZVxuICAgIH0gPSBvcHRpb25zXG5cbiAgICAvLyBJZ25vcmUgaWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IG9ic2VydmVkXG4gICAgaWYob2JqLl9fb2JzZXJ2ZWQpIHJldHVybiBvYmpcblxuICAgIC8vIEFkZCB0aGUgb2JqZWN0IHRvIHRoZSBvYnNlcnZlcnMgbWFwLlxuICAgIC8vIG9ic2VydmVyc01hcCBzaWduYXR1cmUgOiBNYXA8T2JqZWN0LCBNYXA8UHJvcGVydHksIFNldDxDb21wdXRlZCBmdW5jdGlvbj4+PlxuICAgIC8vIEluIGVuZ2xpc2ggOlxuICAgIC8vIG9ic2VydmVyc01hcCBpcyBhIG1hcCBvZiBvYnNlcnZlZCBvYmplY3RzLlxuICAgIC8vIEZvciBlYWNoIG9ic2VydmVkIG9iamVjdCwgZWFjaCBwcm9wZXJ0eSBpcyBtYXBwZWQgd2l0aCBhIHNldCBvZiBjb21wdXRlZCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIHRoaXMgcHJvcGVydHkuXG4gICAgLy8gV2hlbmV2ZXIgYSBwcm9wZXJ0eSBpcyBzZXQsIHdlIHJlLXJ1biBlYWNoIG9uZSBvZiB0aGUgZnVuY3Rpb25zIHN0b3JlZCBpbnNpZGUgdGhlIG1hdGNoaW5nIFNldC5cbiAgICBvYnNlcnZlcnNNYXAuc2V0KG9iaiwgbmV3IE1hcCgpKVxuXG4gICAgLy8gSWYgdGhlIGRlZXAgZmxhZyBpcyBzZXQsIG9ic2VydmUgbmVzdGVkIG9iamVjdHMvYXJyYXlzXG4gICAgZGVlcCAmJiBPYmplY3QuZW50cmllcyhvYmopLmZvckVhY2goZnVuY3Rpb24oW2tleSwgdmFsXSkge1xuICAgICAgICBpZihpc09iaih2YWwpKSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IG9ic2VydmUodmFsLCBvcHRpb25zKVxuICAgICAgICAgICAgLy8gSWYgYnViYmxlIGlzIHNldCwgd2UgYWRkIGtleXMgdG8gdGhlIG9iamVjdCB1c2VkIHRvIGJ1YmJsZSB1cCB0aGUgbXV0YXRpb25cbiAgICAgICAgICAgIGlmKGJ1YmJsZSlcbiAgICAgICAgICAgICAgICBkZWZpbmVCdWJibGluZ1Byb3BlcnRpZXMob2JqW2tleV0sIGtleSwgb2JqKVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIFByb3hpZnkgdGhlIG9iamVjdCBpbiBvcmRlciB0byBpbnRlcmNlcHQgZ2V0L3NldCBvbiBwcm9wc1xuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KG9iaiwge1xuICAgICAgICBnZXQoXywgcHJvcCkge1xuICAgICAgICAgICAgaWYocHJvcCA9PT0gJ19fb2JzZXJ2ZWQnKSByZXR1cm4gdHJ1ZVxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgcHJvcCBpcyB3YXRjaGVkXG4gICAgICAgICAgICBpZigoIXByb3BzIHx8IHByb3BzLmluY2x1ZGVzKHByb3ApKSAmJiAoIWlnbm9yZSB8fCAhaWdub3JlLmluY2x1ZGVzKHByb3ApKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGEgY29tcHV0ZWQgZnVuY3Rpb24gaXMgYmVpbmcgcnVuXG4gICAgICAgICAgICAgICAgaWYoY29tcHV0ZWRTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydGllc01hcCA9IG9ic2VydmVyc01hcC5nZXQob2JqKVxuICAgICAgICAgICAgICAgICAgICBpZighcHJvcGVydGllc01hcC5oYXMocHJvcCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzTWFwLnNldChwcm9wLCBuZXcgU2V0KCkpXG4gICAgICAgICAgICAgICAgICAgIC8vIExpbmsgdGhlIGNvbXB1dGVkIGZ1bmN0aW9uIGFuZCB0aGUgcHJvcGVydHkgYmVpbmcgYWNjZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc01hcC5nZXQocHJvcCkuYWRkKGNvbXB1dGVkU3RhY2tbMF0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb2JqW3Byb3BdXG4gICAgICAgIH0sXG4gICAgICAgIHNldChfLCBwcm9wLCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gRG9uJ3QgdHJhY2sgYnViYmxlIGhhbmRsZXJzXG4gICAgICAgICAgICBpZihwcm9wID09PSAnX19oYW5kbGVyJykge1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICdfX2hhbmRsZXInLCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogZmFsc2UsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnRpZXNNYXAgPSBvYnNlcnZlcnNNYXAuZ2V0KG9iailcbiAgICAgICAgICAgIC8vIElmIHRoZSBuZXcvb2xkIHZhbHVlIGFyZSBlcXVhbCwgcmV0dXJuXG4gICAgICAgICAgICBpZigoIWlzQXJyYXkob2JqKSB8fCBwcm9wICE9PSAnbGVuZ3RoJykgJiYgb2JqW3Byb3BdID09PSB2YWx1ZSkgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIC8vIFJlbW92ZSBidWJibGluZyBpbmZyYXN0cnVjdHVyZSBhbmQgcGFzcyBvbGQgdmFsdWUgdG8gaGFuZGxlcnNcbiAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb2JqW3Byb3BdXG4gICAgICAgICAgICBpZihpc09iaihvbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgb2xkVmFsdWUuX19rZXlcbiAgICAgICAgICAgICAgICBkZWxldGUgb2xkVmFsdWUuX19wYXJlbnRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGRlZXAgZmxhZyBpcyBzZXQgd2Ugb2JzZXJ2ZSB0aGUgbmV3bHkgc2V0IHZhbHVlXG4gICAgICAgICAgICBvYmpbcHJvcF0gPSBkZWVwICYmIGlzT2JqKHZhbHVlKSA/IG9ic2VydmUodmFsdWUsIG9wdGlvbnMpIDogdmFsdWVcblxuICAgICAgICAgICAgLy8gSWYgYXNzaWduaW5nIHRvIGFuIG9iamVjdCBwYXJ0aWNpcGF0aW5nICh3aXR0aW5nbHkgb3IgdW53aXR0aW5nbHkpIGluIGJ1YmJsaW5nLCBkZWZpbmUgdGhlIGJ1YmJsaW5nIGtleXMgcmVjdXJzaXZlbHkgb24gdGhlIG5ldyB2YWx1ZVxuICAgICAgICAgICAgaWYob2JqLl9faGFuZGxlciB8fCBvYmouX19wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICBkZWVwICYmIGlzT2JqKHZhbHVlKSAmJiBkZWZpbmVCdWJibGluZ1Byb3BlcnRpZXMob2JqW3Byb3BdLCBwcm9wLCBvYmosIGRlZXApXG5cbiAgICAgICAgICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgbXV0YXRlZCBwcm9wZXJ0aWVzIGNoYWluICYgY2FsbCBhbnkgX19oYW5kbGVycyBhbG9uZyB0aGUgd2F5XG4gICAgICAgICAgICAgICAgY29uc3QgYW5jZXN0cnkgPSBbIHByb3AgXVxuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBvYmpcbiAgICAgICAgICAgICAgICB3aGlsZShwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYocGFyZW50Ll9faGFuZGxlciAmJiBwYXJlbnQuX19oYW5kbGVyKGFuY2VzdHJ5LCB2YWx1ZSwgb2xkVmFsdWUsIHByb3h5KSA9PT0gZmFsc2UpIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGlmKHBhcmVudC5fX2tleSAmJiBwYXJlbnQuX19wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2VzdHJ5LnVuc2hpZnQocGFyZW50Ll9fa2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50Ll9fcGFyZW50XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBwYXJlbnQgPSBudWxsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgcHJvcCBpcyB3YXRjaGVkXG4gICAgICAgICAgICBpZigoIXByb3BzIHx8IHByb3BzLmluY2x1ZGVzKHByb3ApKSAmJiAoIWlnbm9yZSB8fCAhaWdub3JlLmluY2x1ZGVzKHByb3ApKSkge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnRpZXNNYXAuaGFzKHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHJpZXZlIHRoZSBjb21wdXRlZCBmdW5jdGlvbnMgZGVwZW5kaW5nIG9uIHRoZSBwcm9wXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlcGVuZGVudHMgPSBwcm9wZXJ0aWVzTWFwLmdldChwcm9wKVxuICAgICAgICAgICAgICAgICAgICBmb3IoY29uc3QgZGVwZW5kZW50IG9mIGRlcGVuZGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGRpc3Bvc2VkLCBkZWxldGUgdGhlIGZ1bmN0aW9uIHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGVwZW5kZW50Ll9fZGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbnRzLmRlbGV0ZShkZXBlbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoZGVwZW5kZW50ICE9PSBjb21wdXRlZFN0YWNrWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUnVuIHRoZSBjb21wdXRlZCBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGJhdGNoKSBiYXRjaGVyLmVucXVldWUoZGVwZW5kZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgZGVwZW5kZW50KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KF8sIHByb3ApIHtcbiAgICAgICAgICAgIC8vIFByZXZlbnQgYnViYmxpbmcgbXV0YXRpb25zIGZyb20gc3RyYXkgb2JqZWN0c1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfW3Byb3BdXG4gICAgICAgICAgICBpZihpc09iaih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWUuX19rZXlcbiAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWUuX19wYXJlbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSBfW3Byb3BdXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIGlmKGJpbmQpIHtcbiAgICAgICAgLy8gTmVlZCB0aGlzIGZvciBiaW5kaW5nIGVzNiBjbGFzc2VzIG1ldGhvZHMgd2hpY2ggYXJlIHN0b3JlZCBpbiB0aGUgb2JqZWN0IHByb3RvdHlwZVxuICAgICAgICBjb25zdCBtZXRob2RzID0gW1xuICAgICAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKSxcbiAgICAgICAgICAgIC4uLk9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopICYmIFsnU3RyaW5nJywgJ051bWJlcicsICdPYmplY3QnLCAnQXJyYXknLCAnQm9vbGVhbicsICdEYXRlJ10uaW5kZXhPZihPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKS5jb25zdHJ1Y3Rvci5uYW1lKSA8IDAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgOiBbXVxuICAgICAgICBdLmZpbHRlcihwcm9wID0+IHByb3AgIT0gJ2NvbnN0cnVjdG9yJyAmJiB0eXBlb2Ygb2JqW3Byb3BdID09PSAnZnVuY3Rpb24nKVxuICAgICAgICBtZXRob2RzLmZvckVhY2goa2V5ID0+IG9ialtrZXldID0gb2JqW2tleV0uYmluZChwcm94eSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb3h5XG59XG5cbi8qIE9ic2VydmFibGUgKi9cblxuY29uc3QgT2JzZXJ2YWJsZSA9IEJhc2UgPT4gY2xhc3MgZXh0ZW5kcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBvYnNlcnZlKGRhdGEgfHwgeyB9LCBvcHRpb25zIHx8IHsgZGVlcDogdHJ1ZSwgYmF0Y2g6IHRydWUgfSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XG4gICAgICAgICAgICBzZXQ6IChvYmosIG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlW25hbWVdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpc1tuYW1lXSA9PT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwgeyBnZXQ6ICgpID0+IHN0b3JlW25hbWVdLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eTogKG9iaiwgbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzdG9yZVtuYW1lXVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmpbbmFtZV1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbn1cblxuLyogQ29tcHV0YWJsZSAqL1xuXG5jb25zdCBDb21wdXRhYmxlID0gQmFzZSA9PiBjbGFzcyBleHRlbmRzIEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX19jb21wdXRlZCcsIHsgdmFsdWU6IFsgXSwgZW51bWVyYWJsZTogZmFsc2UgfSlcbiAgICB9XG4gICAgY29tcHV0ZWQoZm4pIHtcbiAgICAgICAgdGhpcy5fX2NvbXB1dGVkLnB1c2goY29tcHV0ZWQoZm4pKVxuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB3aGlsZSh0aGlzLl9fY29tcHV0ZWQubGVuZ3RoKSBkaXNwb3NlKHRoaXMuX19jb21wdXRlZC5wb3AoKSlcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBvYnNlcnZlLFxuICAgIGNvbXB1dGVkLFxuICAgIGRpc3Bvc2UsXG4gICAgT2JzZXJ2YWJsZSxcbiAgICBDb21wdXRhYmxlXG59Il0sIm5hbWVzIjpbImNvbXB1dGVkU3RhY2siLCJvYnNlcnZlcnNNYXAiLCJXZWFrTWFwIiwiaXNPYmoiLCJvIiwiRGF0ZSIsImlzQXJyYXkiLCJBcnJheSIsImRlZmluZUJ1YmJsaW5nUHJvcGVydGllcyIsIm9iamVjdCIsImtleSIsInBhcmVudCIsImRlZXAiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwiZW51bWVyYWJsZSIsImNvbmZpZ3VyYWJsZSIsImVudHJpZXMiLCJmb3JFYWNoIiwidmFsIiwiX19rZXkiLCJfX3BhcmVudCIsImJhdGNoZXIiLCJ0aW1lb3V0IiwicXVldWUiLCJTZXQiLCJbb2JqZWN0IE9iamVjdF0iLCJ0YXNrIiwiY2xlYXIiLCJzZXRUaW1lb3V0IiwicHJvY2VzcyIsImFkZCIsImNvbXB1dGVkIiwiZnVuIiwiYXV0b1J1biIsImNhbGxiYWNrIiwiYmluZCIsInByb3h5IiwiUHJveHkiLCJ0YXJnZXQiLCJ0aGlzQXJnIiwiYXJnc0xpc3QiLCJwZXJmb3JtQ29tcHV0YXRpb24iLCJ1bnNoaWZ0IiwicmVzdWx0IiwiYXBwbHkiLCJzaGlmdCIsInB1c2giLCJjb21wdXRlQXN5bmMiLCJkaXNwb3NlIiwiXyIsIl9fZGlzcG9zZWQiLCJvYnNlcnZlIiwib2JqIiwib3B0aW9ucyIsInByb3BzIiwiaWdub3JlIiwiYmF0Y2giLCJidWJibGUiLCJfX29ic2VydmVkIiwic2V0IiwiTWFwIiwicHJvcCIsImluY2x1ZGVzIiwibGVuZ3RoIiwicHJvcGVydGllc01hcCIsImdldCIsImhhcyIsIm9sZFZhbHVlIiwiX19oYW5kbGVyIiwiYW5jZXN0cnkiLCJkZXBlbmRlbnRzIiwiZGVwZW5kZW50IiwiZGVsZXRlIiwiZW5xdWV1ZSIsImdldE93blByb3BlcnR5TmFtZXMiLCJnZXRQcm90b3R5cGVPZiIsImluZGV4T2YiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJmaWx0ZXIiLCJPYnNlcnZhYmxlIiwiQmFzZSIsImRhdGEiLCJzdXBlciIsInN0b3JlIiwidGhpcyIsInVuZGVmaW5lZCIsImRlbGV0ZVByb3BlcnR5IiwiQ29tcHV0YWJsZSIsImZuIiwiX19jb21wdXRlZCIsInBvcCJdLCJtYXBwaW5ncyI6InNMQUFBLE1BQU1BLEtBQ0FDLEVBQWUsSUFBSUMsUUFJbkJDLEVBQVEsU0FBU0MsR0FBSyxPQUFPQSxHQUFrQixpQkFBTkEsS0FBb0JBLGFBQWFDLE9BQzFFQyxFQUFVQyxNQUFNRCxRQUNoQkUsRUFBMkIsU0FBU0MsRUFBUUMsRUFBS0MsRUFBUUMsR0FDM0RDLE9BQU9DLGVBQWVMLEVBQVEsU0FBV00sTUFBT0wsRUFBS00sWUFBWSxFQUFPQyxjQUFjLElBQ3RGSixPQUFPQyxlQUFlTCxFQUFRLFlBQWNNLE1BQU9KLEVBQVFLLFlBQVksRUFBT0MsY0FBYyxJQUM1RkwsR0FBUUMsT0FBT0ssUUFBUVQsR0FBUVUsUUFBUSxVQUFVVCxFQUFLVSxLQUMvQ2pCLEVBQU1pQixJQUFVQSxFQUFJQyxPQUFVRCxFQUFJRSxVQUFXZCxFQUF5QkMsRUFBT0MsR0FBTUEsRUFBS0QsTUFJN0ZjLEdBQ0ZDLFFBQVMsS0FDVEMsTUFBTyxJQUFJQyxJQUNYQyxVQUNJLElBQUksTUFBTUMsS0FBUUwsRUFBUUUsTUFBT0csSUFDakNMLEVBQVFFLE1BQU1JLFFBQ2ROLEVBQVFDLFFBQVUsTUFFdEJHLFFBQVFDLEdBQ21CLE9BQXBCTCxFQUFRQyxVQUNQRCxFQUFRQyxRQUFVTSxXQUFXUCxFQUFRUSxRQUFTLElBQ2xEUixFQUFRRSxNQUFNTyxJQUFJSixLQU1wQkssRUFBVyxTQUFTQyxHQUFLQyxRQUFFQSxHQUFVLEVBQUlDLFNBQUVBLEVBQVcsS0FBSUMsS0FBRUEsRUFBTyxVQUVyRSxNQUFNQyxFQUFRLElBQUlDLE1BQU1MLEdBQ3BCUCxNQUFNYSxFQUFRQyxFQUFTQyxH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
