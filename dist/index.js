!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Tela=e():t.Tela=e()}(window,(function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var a=e[n]={i:n,l:!1,exports:{}};return t[n].call(a.exports,a,a.exports,r),a.l=!0,a.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)r.d(n,a,function(e){return t[e]}.bind(null,a));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){"use strict";r.r(e),r.d(e,"Canvas",(function(){return m})),r.d(e,"Canvas2D",(function(){return w})),r.d(e,"ImageIO",(function(){return a}));var n={getImageCanvas:function(t){var e=document.createElement("canvas");e.width=t.width,e.height=t.height;var r=e.getContext("2d");return r.fillStyle="rgba(0, 0, 0, 0)",r.globalCompositeOperation="source-over",r.fillRect(0,0,e.width,e.height),r.drawImage(t,0,0),e},getDataFromImage:function(t){return canvas=n.getImageCanvas(t),canvas.getContext("2d").getImageData(0,0,t.width,t.height)},loadImage:function(t){var e=new Image;return e.src=t,e.isReady=!1,e.onload=function(){return e.isReady=!0},e},generateImageReadyPredicate:function(t){return function(){return t.isReady}}},a=n;function i(t,e){var r=[];return r[0]=t[0]+e[0],r[1]=t[1]+e[1],r}function o(t){var e=[];return e[0]=Math.floor(t[0]),e[1]=Math.floor(t[1]),e}function s(t,e){var r=[];return r[0]=t[0]-e[0],r[1]=t[1]-e[1],r}function u(t,e){return t[0]*e[0]+t[1]*e[1]}function c(t){return u(t,t)}function h(t){return Math.sqrt(u(t,t))}function f(t,e){var r=[];return r[0]=Math.min(t[0],e[0]),r[1]=Math.min(t[1],e[1]),r}function g(t,e){var r=[];return r[0]=Math.max(t[0],e[0]),r[1]=Math.max(t[1],e[1]),r}function p(t,e,r){var n=r[1]/t[1];return[n,(-t[0]*n+r[0])/e]}function l(t,e,r){var n=r[0]/t[0];return[n,(-t[1]*n+r[1])/e]}var d,v=function(t){this.canvas=t,this.ctx=t.getContext("2d"),this.image=this.ctx.getImageData(0,0,t.width,t.height),this.imageData=this.image.data};v.prototype.getSize=function(){return[this.canvas.height,this.canvas.width]},v.prototype.paintImage=function(){this.ctx.putImageData(this.image,0,0)},v.prototype.getCanvas=function(){return this.canvas},v.prototype.clearImage=function(t){this.useCanvasCtx((function(e){var r=e.getSize();e.ctx.fillStyle="rgba("+t[0]+","+t[1]+","+t[2]+","+t[3]+")",e.ctx.globalCompositeOperation="source-over",e.ctx.fillRect(0,0,r[1],r[0])}),!0)},v.prototype.useCanvasCtx=function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];e||this.ctx.putImageData(this.image,0,0),t(this),this.image=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height),this.imageData=this.image.data},v.prototype.getImageIndex=function(t){return 4*(this.canvas.width*t[0]+t[1])},v.prototype.getPxl=function(t){var e=this.getImageIndex(t);return[this.imageData[e],this.imageData[e+1],this.imageData[e+2],this.imageData[e+3]]},v.prototype.drawPxl=function(t,e){var r=this.getImageIndex(t);this.imageData[r]=e[0],this.imageData[r+1]=e[1],this.imageData[r+2]=e[2],this.imageData[r+3]=e[3]},v.prototype.drawLine=function(t,e,r){r.points=[t,e];var n=[];n.push(t),n.push(e);for(var a=[],i=[],o=0;o<n.length;o++){0<=(g=n[o])[0]&&g[0]<this.canvas.height&&0<=g[1]&&g[1]<this.canvas.width?a.push(g):i.push(g)}if(2!=a.length){var c=[],h=[e[0]-t[0],e[1]-t[1]];c.push(p(h,-(this.canvas.height-1),[-t[0],-t[1]])),c.push(l(h,-(this.canvas.width-1),[this.canvas.height-1-t[0],-t[1]])),c.push(p(h,this.canvas.height-1,[this.canvas.height-1-t[0],this.canvas.width-1-t[1]])),c.push(l(h,this.canvas.width-1,[-t[0],this.canvas.width-1-t[1]]));var f=[];for(o=0;o<c.length;o++){var g;0<=(g=c[o])[0]&&g[0]<=1&&0<=g[1]&&g[1]<=1&&f.push(g)}if(0!=f.length)if(a.length>0){var d=[t[0]+f[0][0]*h[0],t[1]+f[0][0]*h[1]];this.drawLineInt(a.pop(),d,r)}else{var v=[t[0]+f[0][0]*h[0],t[1]+f[0][0]*h[1]];for(o=1;o<f.length;o++){if(u(h=s(d=[t[0]+f[o][0]*h[0],t[1]+f[o][0]*h[1]],v),h)>.001)return void this.drawLineInt(v,d,r)}this.drawLineInt(v,v,r)}}else this.drawLineInt(a[0],a[1],r)},v.prototype.drawLineInt=function(t,e,r){t=o(t),e=o(e);var n=[-1,0,1],a=n.length,c=a*a,h=[];h[0]=t[0],h[1]=t[1];var f=s(e,t),g=[];for(g[0]=-f[1],g[1]=f[0],r(h,r.points,this);h[0]!==e[0]||h[1]!==e[1];){for(var p=Number.MAX_VALUE,l=[],d=0;d<c;d++){var v=n[d%a],m=n[Math.floor(d/a)],y=s(i(h,[v,m]),t),w=Math.abs(u(y,g))-u(y,f);p>w&&(p=w,l=[v,m])}r(h=i(h,l),r.points,this)}r(h,r.points,this)},v.prototype.drawPolygon=function(t,e){for(var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:v.isInsidePolygon,n=[[Number.MAX_VALUE,Number.MAX_VALUE],[Number.MIN_VALUE,Number.MIN_VALUE]],a=0;a<t.length;a++)n[0]=f(t[a],n[0]),n[1]=g(t[a],n[1]);var i=this.getSize(),u=s(i,[1,1]),c=[0,0];n[0]=o(f(u,g(c,n[0]))),n[1]=o(f(u,g(c,n[1])));for(var h=n[0][0];h<n[1][0];h++)for(var p=n[0][1];p<n[1][1];p++){var l=[h,p];r(l,t)&&e(l,t,this)}},v.prototype.drawTriangle=function(t,e,r,n){var a=[t,e,r];this.drawPolygon(a,n,v.isInsideConvex)},v.prototype.drawQuad=function(t,e,r,n,a){this.drawPolygon([t,e,r,n],a)},v.prototype.drawImage=function(t,e){"isReady"in t&&!t.isReady||this.useCanvasCtx((function(r){return r.ctx.drawImage(t,e[1],e[0])}))},v.prototype.drawCircle=function(t,e,r){var n=function(t,e){var r=[];return r[0]=t[0]*e,r[1]=t[1]*e,r}([1,1],e),a=[s(t,n),i(t,n)],u=this.getSize();a[0]=o(f(s(u,[1,1]),g([0,0],a[0]))),a[1]=o(f(s(u,[1,1]),g([0,0],a[1])));for(var c=a[0][0];c<=a[1][0];c++)for(var h=a[0][1];h<=a[1][1];h++){var p=[c,h];this.isInsideCircle(p,t,e)&&r(p,[t,e],this)}},v.prototype.isInsideCircle=function(t,e,r){return c(s(t,e))<=r*r},v.prototype.addEventListener=function(t,e,r){this.canvas.addEventListener(t,e,r)},v.prototype.drawString=function(t,e,r){this.useCanvasCtx((function(n){r(n.ctx),n.ctx.fillText(e,t[1],t[0])}))},v.isInsidePolygon=function(t,e){for(var r=[],n=0,a=e.length,i=0;i<a;i++)r[0]=s(e[(i+1)%a],t),r[1]=s(e[i],t),n+=Math.acos(u(r[0],r[1])/(h(r[0])*h(r[1])));return Math.abs(n-2*Math.PI)<.001},v.isInsideConvex=function(t,e){for(var r=e.length,n=[],a=[],i=0;i<r;i++){n[i]=s(e[(i+1)%r],e[i]);var o=[-n[i][1],n[i][0]],c=s(t,e[i]);a[i]=u(c,o)}var h=n[0][0]*n[1][1]-n[0][1]*n[1][0]>0?1:-1;for(i=0;i<r;i++){if(a[i]*h<0)return!1}return!0},v.simpleShader=function(t){return function(e,r,n){return n.drawPxl(e,t)}},v.colorShader=function(t){return v.interpolateTriangleShader((function(e,r,n,a){for(var i=[0,0,0,0],o=0;o<r.length;o++)i[0]=i[0]+t[o][0]*a[o],i[1]=i[1]+t[o][1]*a[o],i[2]=i[2]+t[o][2]*a[o],i[3]=i[3]+t[o][3]*a[o];n.drawPxl(e,i)}))},v.interpolateQuadShader=function(t){return function(e,r,n){var a=[r[0],r[1],r[2]],i=[r[2],r[3],r[0]],o=v.triangleBaryCoord(e,a);o[0]>0&&o[1]>0&&o[2]>0&&Math.abs(o[0]+o[1]+o[2]-1)<1e-10?t(e,r,n,[o[0],o[1],o[2],0]):(o=v.triangleBaryCoord(e,i),t(e,r,n,[o[2],0,o[0],o[1]]))}},v.interpolateTriangleShader=function(t){return function(e,r,n){var a=v.triangleBaryCoord(e,r);t(e,r,n,a)}},v.interpolateLineShader=function(t){return function(e,r,n){var a=s(r[1],r[0]),i=s(e,r[0]),o=c(a),h=u(i,a);t(e,r,n,0==o?0:h/o)}},v.quadTextureShader=function(t,e){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:v.bilinearInterpolation,n=null,u=function(u,c,h,p){t.isReady&&null!=n||(n=new v(a.getImageCanvas(t)));for(var l=n,d=l.getSize(),m=[0,0],y=0;y<e.length;y++)m[0]=m[0]+e[y][0]*p[y],m[1]=m[1]+e[y][1]*p[y];var w=[(1-m[1])*(d[1]-1),(d[0]-1)*m[0]],x=o(w=g([0,0],f(s([d[0],d[1]],[1,1]),w))),I=[l.getPxl(x),l.getPxl(i(x,[1,0])),l.getPxl(i(x,[1,1])),l.getPxl(i(x,[0,1]))],C=r(I,s(w,x));h.drawPxl(u,C)};return v.interpolateQuadShader(u)},v.triangleCache=(d=[],{constains:function(t){return null!=d[t%3]},get:function(t){return d[t%3]},set:function(t,e){return d[t%3]=e}}),v.triangleHash=function(t){return[t[0][0],t[1][0],t[2][0],t[0][1],t[1][1],t[2][1]].reduce((function(t,e){return 31*t+e}),1)},v.triangleBaryCoord=function(t,e){var r=v.triangleHash(e),n=[t[0]-e[0][0],t[1]-e[0][1]];if(!v.triangleCache.constains(r)){var a=[e[1][0]-e[0][0],e[1][1]-e[0][1]],i=[e[2][0]-e[0][0],e[2][1]-e[0][1]],o=a[0]*i[1]-a[1]*i[0];v.triangleCache.set(r,{triangle:e,u:a.map((function(t){return t/o})),v:i.map((function(t){return t/o})),det:o,hash:r})}var s=v.triangleCache.get(r),u=s.u,c=s.v;if(0==s.det)return[0,0,0];var h=[c[1]*n[0]-c[0]*n[1],u[0]*n[1]-u[1]*n[0]];return[1-h[0]-h[1],h[0],h[1]]},v.bilinearInterpolation=function(t,e){for(var r=[],n=0;n<t.length;n++){var a=t[0][n]+(t[3][n]-t[0][n])*e[1],i=a+(t[1][n]+(t[2][n]-t[1][n])*e[1]-a)*e[0];r.push(i)}return r},v.createCanvas=function(t,e){var r=document.createElement("canvas");return r.setAttribute("width",t[0]),r.setAttribute("height",t[1]),document.getElementById(e).appendChild(r),r};var m=v,y=function(t,e){if(m.call(this,t),2!=e.length||2!=e[0].length&&2!=e[1].length)throw"camera space must be 2-dim array with 2-dim arrays representing an interval";this.cameraSpace=e};(y.prototype=Object.create(m.prototype)).constructor=y,y.prototype.integerTransform=function(t){return[-(this.canvas.height-1)/(this.cameraSpace[1][1]-this.cameraSpace[1][0])*(t[1]-this.cameraSpace[1][1]),(this.canvas.width-1)/(this.cameraSpace[0][1]-this.cameraSpace[0][0])*(t[0]-this.cameraSpace[0][0])]},y.prototype.inverseTransform=function(t){return[this.cameraSpace[0][0]+(this.cameraSpace[0][1]-this.cameraSpace[0][0])/(this.canvas.width-1)*t[1],this.cameraSpace[1][1]-(this.cameraSpace[1][1]-this.cameraSpace[1][0])/(this.canvas.height-1)*t[0]]},y.prototype.drawLine=function(t,e,r){var n=this.integerTransform(t),a=this.integerTransform(e);m.prototype.drawLine.call(this,n,a,r)},y.prototype.drawTriangle=function(t,e,r,n){var a=this.integerTransform(t),i=this.integerTransform(e),o=this.integerTransform(r);m.prototype.drawTriangle.call(this,a,i,o,n)},y.prototype.drawQuad=function(t,e,r,n,a){var i=this.integerTransform(t),o=this.integerTransform(e),s=this.integerTransform(r),u=this.integerTransform(n);m.prototype.drawQuad.call(this,i,o,s,u,a)},y.prototype.drawCircle=function(t,e,r){var n=this.integerTransform(t),a=this.integerTransform([e,0])[1]-this.integerTransform([0,0])[1];m.prototype.drawCircle.call(this,n,a,r)},y.prototype.drawImage=function(t,e){m.prototype.drawImage.call(this,t,this.integerTransform(e))},y.prototype.drawString=function(t,e,r){var n=this.integerTransform(t);m.prototype.drawString.call(this,n,e,r)},y.prototype.setCamera=function(t){if(2!=t.length||2!=t[0].length&&2!=t[1].length)throw"camera space must be 2-dim array with 2-dim arrays representing an interval";this.cameraSpace=t};var w=y}])}));
//# sourceMappingURL=index.js.map