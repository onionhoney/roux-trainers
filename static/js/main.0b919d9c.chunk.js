(this["webpackJsonpcmll-trainer"]=this["webpackJsonpcmll-trainer"]||[]).push([[0],{55:function(e,t,n){e.exports=n(64)},60:function(e,t,n){},64:function(e,t,n){"use strict";n.r(t);var r,a=n(0),o=n.n(a),c=n(23),i=n.n(c),l=(n(60),n(13));!function(e){e[e.U=0]="U",e[e.D=1]="D",e[e.F=2]="F",e[e.B=3]="B",e[e.L=4]="L",e[e.R=5]="R",e[e.X=6]="X"}(r||(r={}));var u,s=r.U,f=r.D,d=r.F,m=r.B,p=r.L,g=r.R;!function(e){e[e.C=0]="C",e[e.E=1]="E",e[e.T=2]="T"}(u||(u={}));var v=u.C,R=u.E,h=u.T,b=[[s,d,p],[s,p,m],[s,m,g],[s,g,d],[f,p,d],[f,m,p],[f,g,m],[f,d,g]],U=[[s,d],[s,p],[s,m],[s,g],[f,d],[f,p],[f,m],[f,g],[d,p],[m,p],[m,g],[d,g]],y={cpc:[[0,1],[1,2],[2,3],[3,0]],coc:[0,0,0,0],epc:[[0,1],[1,2],[2,3],[3,0]],eoc:[0,0,0,0],tpc:[],name:"U"},O={cpc:[[0,3],[3,7],[7,4],[4,0]],coc:[1,2,1,2],epc:[[0,11],[11,4],[4,8],[8,0]],eoc:[1,1,1,1],tpc:[],name:"F"},_={cpc:[[3,2],[2,6],[6,7],[7,3]],coc:[1,2,1,2],epc:[[3,10],[10,7],[7,11],[11,3]],eoc:[0,0,0,0],tpc:[],name:"R"},w={cpc:[[0,4],[4,5],[5,1],[1,0]],coc:[2,1,2,1],epc:[[1,8],[8,5],[5,9],[9,1]],eoc:[0,0,0,0],tpc:[],name:"L"},k={cpc:[[4,7],[7,6],[6,5],[5,4]],coc:[0,0,0,0],epc:[[4,7],[7,6],[6,5],[5,4]],eoc:[0,0,0,0],tpc:[],name:"D"},E={cpc:[[1,5],[5,6],[6,2],[2,1]],coc:[2,1,2,1],epc:[[2,9],[9,6],[6,10],[10,2]],eoc:[1,1,1,1],tpc:[],name:"B"},j={cpc:[],coc:[],epc:[[0,4],[4,6],[6,2],[2,0]],eoc:[1,1,1,1],tpc:[[0,2],[2,1],[1,3],[3,0]],name:"M"},F={cpc:[],coc:[],epc:[[8,9],[9,10],[10,11],[11,8]],eoc:[1,1,1,1],tpc:[[2,4],[4,3],[3,5],[5,2]],name:"E"},S=[[1,0,v],[2,0,R],[2,0,v],[1,0,R],[0,0,h],[3,0,R],[0,0,v],[0,0,R],[3,0,v]],B=[[0,1,v],[0,1,R],[3,2,v],[8,0,R],[2,0,h],[11,0,R],[4,2,v],[4,1,R],[7,1,v]],x="   UUU\n   UUU\n   UUU\nLLLFFFRRRBBB\nLLLFFFRRRBBB\nLLLFFFRRRBBB\n   DDD\n   DDD\n   DDD",D={I:"R",K:"R'",W:"B",O:"B'",S:"D",L:"D'",D:"L",E:"L'",J:"U",F:"U'",H:"F",G:"F'",";":"y",A:"y'",U:"r",R:"l'",M:"r'",V:"l",T:"x",Y:"x",N:"x'",B:"x'",".":"M'",X:"M'",5:"M",6:"M",P:"z",Q:"z'",Z:"d",C:"u'",",":"u","/":"d'",ENTER:"#enter"," ":"#space"},L=n(2),C=n(66),W=n(100),G=n(46),P=n(96),N=n(101),Y=n(97),M=n(4),T=n(10),A=n(8),I=2*Math.PI,z=[[new A.j(0,1,0),new A.b(-I/4,0,0)],[new A.j(0,-1,0),new A.b(I/4,0,0)],[new A.j(0,0,1),new A.b(0,0,0)],[new A.j(0,0,-1),new A.b(0,I/2,0)],[new A.j(-1,0,0),new A.b(0,-I/4,0)],[new A.j(1,0,0),new A.b(0,I/4,0)]],H=function(e,t,n,a,o){var c,i,l=o||[r.L,r.B,r.D],u=new A.i,s=new A.g(70,e/t,.1,1e3),f=new A.k({antialias:!0}),d=new A.h(1.8,1.8),m=new A.h(2,2);f.setPixelRatio(window.devicePixelRatio),"FRU"===(a=a||"FRU")?s.position.copy(new A.j(2.6/1.1,3/1.1,3/1.1)):s.position.copy(new A.j(0,3/1.1,3/1.1)),s.lookAt(new A.j(0,0,0));var p=new A.c;u.add(p);var g=function(e,t){var n=f.domElement;(n.width!==e||n.height!==t)&&(f.setSize(e,t,!0),f.setClearColor("#fafafa"),s.aspect=e/t,s.updateProjectionMatrix())};return g(e,t),{domElement:function(){return f.domElement},updateCube:function(e){u.remove(p),p=function(e){for(var t=new A.c,n=0;n<6;n++){var r=new A.c,a=(new A.d).makeRotationFromEuler(z[n][1]),o=(new A.d).makeRotationFromEuler(z[1][1]);r.setRotationFromMatrix(a.multiply(o));for(var u=-1;u<=1;u++)for(var s=-1;s<=1;s++){var f=3*(u+1)+(s+1),d=c[e[n][f]],m=d.clone(),p=i.clone();if(m.position.copy(new A.j(2*s,3,2*u)),p.position.copy(new A.j(2*s,2.96,2*u)),l.indexOf(n)>-1){var g=d.clone();g.position.copy(new A.j(2*s,9,2*u)),r.add(g)}r.add(m),r.add(p)}t.add(r)}return t.scale.set(1/3,1/3,1/3),t}(e),u.add(p)},renderScene:function(){f.render(u,s)},updateWidthHeight:g,cleanup:function(){d.dispose()},updateColorScheme:function(e){var t=e,n=Array(7).fill(0).map((function(e,n){return new A.f({color:t[n],side:A.a})})),r=new A.f({color:0,side:A.a});c=n.map((function(e){var t=new A.e(d,e);return t.setRotationFromEuler(z[0][1]),t})),i=function(){var e=new A.e(m,r);return e.setRotationFromEuler(z[0][1]),e}()},updateFacesToReveal:function(e){l=e}}}(370,370);var X=function(e){var t=o.a.useRef(null),n=e.width,r=e.height;return Object(a.useEffect)((function(){var a=H.domElement(),o=t.current;return o.appendChild(a),H.updateFacesToReveal(e.facesToReveal),H.updateWidthHeight(n,r),H.updateColorScheme(e.colorScheme),H.updateCube(e.cube),H.renderScene(),function(){o.removeChild(a)}})),o.a.createElement("div",{ref:t,style:{width:e.width,height:e.height}})},J=n(90),q=n(103),K=n(67),Q=n(91),V=n(92),Z=n(68),$=function(e){return Math.floor(Math.random()*e)},ee=function(e,t){return $(t-e+1)+e},te=function(e){return e[$(e.length)]},ne=function(e){var t=Array(e.length).fill(!1),n=function n(r,a){return t[r]?0:(t[r]=1,n(e[r],a+1))},r=0,a=!0,o=!1,c=void 0;try{for(var i,l=e[Symbol.iterator]();!(a=(i=l.next()).done);a=!0){r+=n(i.value,0)}}catch(u){o=!0,c=u}finally{try{a||null==l.return||l.return()}finally{if(o)throw c}}return r},re=function(e,t){if(e.length!==t.length)return!1;for(var n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0},ae=function(){var e={cp:[0,1,2,3,4,5,6,7],co:[0,0,0,0,0,0,0,0],ep:[0,1,2,3,4,5,6,7,8,9,10,11],eo:[0,0,0,0,0,0,0,0,0,0,0,0],tp:[0,1,2,3,4,5]},t=function(e,t,n,r,a){var o=Object(T.a)(e),c=Object(T.a)(t);console.assert(n.length===r.length);for(var i=0;i<n.length;i++){var l=r[i][0],u=r[i][1];c[u]=t[l],o[u]=(e[l]+n[i])%a}return[o,c]},n=function(e,n){var r=t(e.co,e.cp,n.coc,n.cpc,3),a=Object(l.a)(r,2),o=a[0],c=a[1],i=t(e.eo,e.ep,n.eoc,n.epc,2),u=Object(l.a)(i,2),s=u[0],f=u[1],d=Array(n.tpc.length).fill(0),m=t([0,0,0,0,0,0],e.tp,d,n.tpc,1);return{co:o,cp:c,eo:s,ep:f,tp:Object(l.a)(m,2)[1]}},r=function(e,t){if(Array.isArray(t)){for(var r=0;r<t.length;r++)e=n(e,t[r]);return e}return n(e,t)};return{id:e,apply:r,from_move:function(t){return r(e,t)}}}(),oe=function(){var e=function(e,t){return function(e,t){var n=function(e,t,n,r){for(var a=0;a<e.length;a++)a===e[a]&&0===t[a]||(n.push([e[a],a]),r.push(t[a]))},r=[],a=[],o=[],c=[],i=[];return n(e.cp,e.co,r,a),n(e.ep,e.eo,o,c),n(e.tp,[0,0,0,0,0,0],i,[]),{cpc:r,coc:a,epc:o,eoc:c,tpc:i,name:t}}(ae.apply(ae.id,e),t)},t=function(t){return[t,e([t,t],t.name+"2"),e([t,t,t],t.name+"'")]},n=new Map([["U",1],["U'",1],["U2",1.4],["R",1],["R'",1],["R2",1.4],["r",1],["r'",1],["r2",1.5],["L",1],["L'",1],["L2",1.4],["F",1.4],["F'",1.4],["F2",1.8],["B",1.5],["B'",1.5],["B2",2],["D",1.4],["D'",1.4],["D2",1.7],["M",1.5],["M'",1.2],["M2",1.8]]);var r=function(){var n=t(y),r=t(O),a=t(_),o=t(w),c=t(k),i=t(E),l=t(j),u=t(F),s=e([_,l[2]],"r"),f=t(s),d=e([w,j],"l"),m=t(d),p=e([y,F],"u"),g=t(p),v=e([_,o[2],l[2]],"x"),R=t(v),h=e([y,F,c[2]],"y"),b=t(h),U=e([v,h,v,v,v],"z"),S=[n,r,a,o,c,i,l,u,R,b,t(U),f,m,g].flat(),B=Object.create({});return S.forEach((function(e){return B[e.name]=e})),B}();return{all:r,parse:function(e){for(var t=[],n="",a=0;a<e.length;a++){var o=e[a];if("2"===o||"'"===o)n+=e[a],t.push(n),n="";else if(" "===o)n.length>0&&t.push(n),n="";else{var c=o.charCodeAt(0);(65<=c&&c<91||97<=c&&c<123)&&(n.length>0&&(t.push(n),n=""),n+=e[a])}}n.length>0&&t.push(n);for(var i=[],l=0,u=t;l<u.length;l++){var s=u[l],f=r[s];if(!f)return[];i.push(f)}return i},inv:function e(t){if(Array.isArray(t))return t.slice(0).reverse().map(e).flat();var n;switch(t.name[t.name.length-1]){case"'":n=t.name.slice(0,t.name.length-1);break;case"2":n=t.name;break;default:n=t.name+"'"}return[r[n]]},add_auf:function(e,t){var n=(t=t||[[],oe.all.U,oe.all["U'"],oe.all.U2])[Math.floor(Math.random()*t.length)];return Array.isArray(n)?e.concat(n):(e.push(n),e)},to_string:function e(t){return Array.isArray(t)?t.map(e).join(" "):t.name},from_moves:e,evaluate:function(e){var t=0,r=!0,a=!1,o=void 0;try{for(var c,i=e[Symbol.iterator]();!(r=(c=i.next()).done);r=!0){var l=c.value;t+=n.get(l.name)||1.4}}catch(u){a=!0,o=u}finally{try{r||null==i.return||i.return()}finally{if(a)throw o}}return t}}}(),ce=function(){var e=function(e,t){for(var n=Object(T.a)(e),r=function(t,r,a){for(var o=function(e){switch(e){case v:return 3;case R:return 2;case h:return 1}}(a),c=Object(l.a)(t,2),i=c[0],u=c[1],s=0;s<e.length;s++){var f=Object(l.a)(e[s],3),d=f[0],m=f[1];f[2]===a&&d===i&&(n[s]=[u,(m+r)%o,a])}},a=0;a<t.cpc.length;a++)r(t.cpc[a],t.coc[a],v);for(var o=0;o<t.epc.length;o++)r(t.epc[o],t.eoc[o],R);for(var c=0;c<t.tpc.length;c++)r(t.tpc[c],0,h);return n},t=function(e,t,n){return b[e][(3-t+n)%3]},n=function(e,t,n){return U[e][(2-t+n)%2]},a=function(e){return[s,f,d,m,p,g][e]},o=oe.all,c={d_face:e(B,o["x'"]),l_face:e(B,o.y),r_face:e(B,o["y'"]),b_face:e(B,o.y2)},i=c.d_face,u=c.l_face,y=c.r_face,O=c.b_face;return{from_cubie:function(e,o){var c=[S,i,B,O,u,y];return o?c.map((function(c){return function(e,o,c){return o.map((function(o){var i=Object(l.a)(o,3),u=i[0],s=i[1],f=i[2];if(f===v)return 1===c.cp[e.cp[u]]?t(e.cp[u],e.co[u],s):r.X;if(f===R)return 1===c.ep[e.ep[u]]?n(e.ep[u],e.eo[u],s):r.X;if(f===h)return c.tp&&0===c.tp[e.tp[u]]?r.X:a(e.tp[u]);throw Error("unidentified type "+f)}))}(e,c,o)})):c.map((function(r){return function(e,r){return r.map((function(r){var o=Object(l.a)(r,3),c=o[0],i=o[1],u=o[2];if(u===v)return t(e.cp[c],e.co[c],i);if(u===R)return n(e.ep[c],e.eo[c],i);if(u===h)return a(e.tp[c]);throw Error("unidentified type "+u)}))}(e,r)}))},to_unfolded_cube_str:function(e){for(var t=[0,0,0,0,0,0],n={U:s,D:f,F:d,B:m,L:p,R:g},r="",a=0;a<x.length;a++){var o=x[a];if(n.hasOwnProperty(o)){var c=n[o],i=t[c];r+="UDFBLR"[e[c][i]],t[c]+=1}else r+=x[a]}return r}}}(),ie={cp:[1,1,1,1,1,1,1,1],ep:[0,0,0,0,0,1,0,1,1,1,1,1]},le={cp:[0,0,0,0,0,1,0,0],ep:[0,0,0,0,0,1,0,0,0,1,0,0]},ue={cp:[0,0,0,0,1,0,0,0],ep:[0,0,0,0,0,1,0,0,1,0,0,0]},se=function(){var e=[[],oe.all.U,oe.all["U'"],oe.all.U2],t=[[],oe.all.M,oe.all["M'"],oe.all.M2],n=[[],oe.all.M2],r=function(e){var t=e.co,n=e.eo,r=e.cp,a=e.ep;t=t||r,n=n||a;var o,c,i,l=function(e,t){var n,r=Array(e.length).fill(0),a=t===v?3:2;do{for(var o in n=0,e)0===e[o]&&(r[o]=$(a),n+=r[o])}while(n%a>0);return r},u=function(e){for(var t=Array(e.length).fill(0),n=[],r=0;r<e.length;r++)0===e[r]?n.push(r):t[r]=r;!function(e){for(var t=0,n=e.length;t<n-1;t++){var r=ee(t,n-1),a=e[t];e[t]=e[r],e[r]=a}}(n);for(var a=0,o=0;a<e.length;a++)0===e[a]&&(t[a]=n[o],o+=1);return t};do{var s=[u(r),u(a)];c=s[1],i=ne(o=s[0])+ne(c)&1}while(i>0);return{co:l(t,v),cp:o,eo:l(n,R),ep:c,tp:[0,1,2,3,4,5]}};return{is_cmll_solved:function(t){return function(e,t,n){var r=t.co,a=t.eo,o=t.cp,c=t.ep;r=r||o,a=a||c;var i=!0,l=!1,u=void 0;try{for(var s,f=n[Symbol.iterator]();!(i=(s=f.next()).done);i=!0){for(var d=s.value,m=ae.apply(e,d),p=!0,g=0;g<8&&p;g++)(r[g]&&0!==m.co[g]||o[g]&&m.cp[g]!==g)&&(p=!1);for(var v=0;v<12&&p;v++)(a[v]&&0!==m.eo[v]||c[v]&&m.ep[v]!==v)&&(p=!1);if(p)return!0}}catch(R){l=!0,u=R}finally{try{i||null==f.return||f.return()}finally{if(l)throw u}}return!1}(t,ie,e)},get_random_lse:function(){var e=r(ie);return ae.apply(e,te(n))},get_random_fs_front:function(){var e=r(ue);return ae.apply(e,te(t))},get_random_fs_back:function(){var e=r(le);return ae.apply(e,te(t))},ori_to_color_scheme:function(){var e=new Map([["G",65280],["B",255],["R",16711680],["O",16746496],["Y",16776960],["W",16777215],["X",13421772]]),t=Object.create({});["WYGBOR","WYBGRO","WYROGB","WYORBG","YWGBRO","YEBGOR","YWROBG","YWORGB","GBWYRO","GBYWOR","GBROYW","GBORWY","BGWYOR","BGYWRO","BGROWY","BGORYW","ORWYGB","ORYWBG","ORGBWY","ORBGYW","ROWYBG","ROYWGB","ROGBYW","ROBGWY"].forEach((function(n){var r=n.split("").map((function(t){return e.get(t)}));r.push(e.get("X")),t[n[0]+n[2]]=r}));return function(e){return t[e]}}(),is_cube_solved:function(e){var t=ae.id;return re(e.co,t.co)&&re(e.eo,t.eo)&&re(e.cp,t.cp)&&re(e.ep,t.ep)}}}(),fe={lse_mask:ie,fs_back_mask:le,fbdr_mask:{cp:[0,0,0,0,1,1,0,0],ep:[0,0,0,0,0,1,0,1,1,1,0,0],tp:[0,0,0,0,1,1]},sb_mask:{cp:[0,0,0,0,1,1,1,1],ep:[0,0,0,0,0,1,0,1,1,1,1,1],tp:[0,0,0,0,1,1]},cmll_mask:{cp:[1,1,1,1,1,1,1,1],ep:[0,0,0,0,0,1,0,1,1,1,1,1],tp:[0,0,0,0,1,1]}},de=(n(41),n(3));function me(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}var pe=Object(G.a)((function(e){return{container:{paddingTop:e.spacing(2),paddingBottom:e.spacing(2)},paper:{padding:e.spacing(2),display:"flex",overflow:"auto",flexDirection:"column"},fixedHeight:{height:420},canvasPaper:{padding:e.spacing(0),display:"flex",overflow:"auto",flexDirection:"column"},title:{flexGrow:1}}}));function ge(e){var t=e.selector,n=e.handleChange;return o.a.createElement(K.a,{row:!0},t.names.map((function(e,r){return function(e,t){return o.a.createElement(J.a,{control:o.a.createElement(q.a,{checked:t,onChange:n(e)}),label:e,color:"primary",key:e})}(e,!!t.flags[r])})))}var ve=function(e){var t=e.state,n=e.dispatch,a=t.cube.state,c=t.config,i=pe(),l=Object(de.a)(i.canvasPaper,i.fixedHeight),u=ce.from_cubie(a),s=o.a.useCallback((function(e){return function(t){return function(){var r=e(c),a=r.names,o=r.flags,i=Object(T.a)(o),l=a.indexOf(t);0<=l&&l<i.length&&(i[l]=1-i[l]);var u=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?me(n,!0).forEach((function(t){Object(M.a)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):me(n).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},c);e(u).flags=i,n({type:"config",content:u})}}}),[c,n]);return o.a.createElement(Q.a,{maxWidth:"lg",className:i.container},o.a.createElement(V.a,{container:!0,spacing:3,justify:"center",alignItems:"center"},o.a.createElement(V.a,{item:!0,xs:12,md:10,lg:8},o.a.createElement(Z.a,{className:l},o.a.createElement(W.a,{margin:"auto"},o.a.createElement(X,{width:400,height:400,cube:u,colorScheme:se.ori_to_color_scheme(e.state.cube.ori),facesToReveal:[r.L]}))))),o.a.createElement(V.a,{container:!0,spacing:3,justify:"center",alignItems:"center"},o.a.createElement(V.a,{item:!0,xs:12,md:10,lg:8},o.a.createElement(ge,{selector:c.cmllSelector,handleChange:s((function(e){return e.cmllSelector}))})),o.a.createElement(V.a,{item:!0,xs:12,md:10,lg:8},o.a.createElement(ge,{selector:c.cmllAufSelector,handleChange:s((function(e){return e.cmllAufSelector}))})),o.a.createElement(V.a,{item:!0,xs:12,md:10,lg:8},o.a.createElement(ge,{selector:c.triggerSelector,handleChange:s((function(e){return e.triggerSelector}))})),o.a.createElement(V.a,{item:!0,xs:12,md:10,lg:8},o.a.createElement(ge,{selector:c.orientationSelector,handleChange:s((function(e){return e.orientationSelector}))}))))},Re=n(93),he=n(94),be=n(104),Ue=n(105),ye=n(95),Oe=n(102);function _e(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function we(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?_e(n,!0).forEach((function(t){Object(M.a)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):_e(n).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var ke=Object(G.a)((function(e){return{container:{paddingTop:e.spacing(0),paddingBottom:e.spacing(2)},button:{margin:e.spacing(0)},paper:{padding:e.spacing(3),display:"flex",overflow:"auto",flexDirection:"column"},canvasPaper:{padding:e.spacing(0),display:"flex",overflow:"auto",flexDirection:"column"},infoColumn:{color:"gray"},scrambleColumn:{paddingLeft:e.spacing(3)},textColumn:Object(M.a)({color:"black"},e.breakpoints.up("sm"),{minHeight:138}),fixedHeight:{height:250},title:{flexGrow:1}}}));function Ee(e){var t=e.state,n=e.dispatch,r=t.config,a=t.config.fbdrSelector,c=function(){for(var e=a.names,t=a.flags,n=0;n<t.length;n++)if(1===t[n])return e[n];return""}();return o.a.createElement(be.a,{component:"fieldset"},o.a.createElement(Ue.a,{component:"legend"},"Position of last pair"),o.a.createElement(ye.a,{"aria-label":"position",name:"position",value:c,onChange:function(e){for(var a=t.config.fbdrSelector.names,o=a.length,c=Array(o).fill(0),i=0;i<a.length;i++)a[i]===e.target.value&&(c[i]=1);var l=we({},r,{fbdrSelector:we({},t.config.fbdrSelector,{flags:c})});n({type:"config",content:l})},row:!0},a.names.map((function(e){return o.a.createElement(J.a,{key:e,value:e,control:o.a.createElement(Oe.a,{color:"primary"}),label:e,labelPlacement:"end"})}))))}var je=function(e){var t=e.state,n=e.dispatch,a=t.cube.state,c=ke(),i=ce.from_cubie(a,fe.fbdr_mask),l=t.case.desc[0]||{alg:"",setup:"Press next for new case"},u=l.alg,s=l.setup,f=l.alt_algs,d="hiding"===t.name?"Reveal":"Next",m=void 0!==f?[u].concat(Object(T.a)(f)):[u],p=m.map((function(e){return oe.parse(e).length})).reduce((function(e,t){return Math.min(e,t)}),100),g="hiding"===t.name?"(Best = ".concat(p," STM)"):"revealed"===t.name&&u.length>0?m.join("\n"):"";return o.a.createElement(W.a,{className:c.container},o.a.createElement(Q.a,{maxWidth:"sm",className:c.container},o.a.createElement(V.a,{container:!0},o.a.createElement(V.a,{item:!0,xs:12},o.a.createElement(Z.a,{className:Object(de.a)(c.canvasPaper,c.fixedHeight)},o.a.createElement(W.a,{margin:"auto"},o.a.createElement(X,{width:250,height:250,cube:i,colorScheme:se.ori_to_color_scheme(e.state.cube.ori),facesToReveal:[r.L,r.B,r.D]}))))),o.a.createElement(Z.a,{className:c.paper,elevation:2},o.a.createElement(V.a,{container:!0,spacing:2},o.a.createElement(V.a,{item:!0,xs:12,sm:6,className:c.scrambleColumn},o.a.createElement(V.a,{container:!0,spacing:2,justify:"center",alignItems:"center"},o.a.createElement(V.a,{item:!0,xs:12,className:c.infoColumn},o.a.createElement(W.a,{display:"flex"},o.a.createElement(W.a,{fontWeight:500,border:3,borderTop:0,borderLeft:0,borderRight:0,color:"primary.main",borderColor:"primary.main"},"Scramble"))),o.a.createElement(V.a,{item:!0,xs:12},o.a.createElement(W.a,{paddingBottom:1,lineHeight:1,fontSize:20,fontWeight:400,className:c.textColumn},o.a.createElement(C.a,{style:{whiteSpace:"pre-line",fontSize:20,fontWeight:400}},s))))),o.a.createElement(V.a,{item:!0,xs:12,sm:6},o.a.createElement(V.a,{container:!0,spacing:2,justify:"center",alignItems:"center"},o.a.createElement(V.a,{item:!0,xs:12,className:c.infoColumn},o.a.createElement(W.a,{display:"flex"},o.a.createElement(W.a,{fontWeight:500,border:3,borderTop:0,borderLeft:0,borderRight:0,color:"primary.main",borderColor:"primary.main"},"Solution"))),o.a.createElement(V.a,{item:!0,xs:12,className:c.textColumn},o.a.createElement(W.a,{paddingBottom:2,lineHeight:1,fontSize:10,fontWeight:400},o.a.createElement(C.a,{style:{whiteSpace:"pre-line",fontSize:16}},g)))))),o.a.createElement(V.a,{container:!0,spacing:0},o.a.createElement(V.a,{item:!0,xs:6},o.a.createElement(Re.a,{onFocus:function(e){return e.target.blur()},className:c.button,size:"medium",variant:"contained",color:"primary",onClick:function(){n({type:"key",content:"#space"})}}," ",d)))),o.a.createElement(W.a,{height:20}),o.a.createElement(he.a,null),o.a.createElement(W.a,{height:20}),o.a.createElement(Ee,{state:t,dispatch:n}," ")))};function Fe(e){var t=e.children,n=e.value,r=e.index,a=Object(L.a)(e,["children","value","index"]);return o.a.createElement(C.a,Object.assign({component:"div",role:"tabpanel",hidden:n!==r,id:"simple-tabpanel-".concat(r),"aria-labelledby":"simple-tab-".concat(r)},a),n===r&&o.a.createElement(W.a,{p:3},t))}var Se=Object(G.a)((function(e){return{page:{backgroundColor:"#eee"}}}));var Be=function(e){var t=e.state,n=e.dispatch,r=Se(),a=o.a.useCallback((function(e,t){s(t);n({type:"mode",content:["cmll","fbdr"][t]})}),[n]),c=o.a.useState(1),i=Object(l.a)(c,2),u=i[0],s=i[1];return o.a.createElement("main",null,o.a.createElement(P.a,{position:"static"},o.a.createElement(N.a,{value:u,onChange:a,"aria-label":"simple tabs example"},o.a.createElement(Y.a,{label:"CMLL Trainer",id:"tab0"}),o.a.createElement(Y.a,{label:"FBDR Trainer",id:"tab1"}))),o.a.createElement(Fe,{value:u,index:0,className:r.page},o.a.createElement(ve,{state:t,dispatch:n})),o.a.createElement(Fe,{value:u,index:1,className:r.page},o.a.createElement(je,{state:t,dispatch:n})))},xe=n(18),De=n(19),Le=n(20),Ce=n(16),We=n(17),Ge={id:"empty",alg:"",kind:"any"},Pe=[{id:"o_adjacent_swap",alg:"R U R' F' R U R' U' R' F R2 U' R'",kind:"cmll"},{id:"o_diagonal_swap",alg:"r2 D r' U r D' R2 U' F' U' F",kind:"cmll"},{id:"h_columns",alg:"R U R' U R U' R' U R U2 R'",kind:"cmll"},{id:"h_rows",alg:"F R U R' U' R U R' U' R U R' U' F'",kind:"cmll"},{id:"h_column",alg:"U R U2' R2' F R F' U2 R' F R F'",kind:"cmll"},{id:"h_row",alg:"r U' r2' D' r U' r' D r2 U r'",kind:"cmll"},{id:"pi_right_bar",alg:"F R U R' U' R U R' U' F'",kind:"cmll"},{id:"pi_back_slash",alg:"U F R' F' R U2 R U' R' U R U2' R'",kind:"cmll"},{id:"pi_x_checkerboard",alg:"U' R' F R U F U' R U R' U' F'",kind:"cmll"},{id:"pi_forward_slash",alg:"R U2 R' U' R U R' U2' R' F R F'",kind:"cmll"},{id:"pi_columns",alg:"U' r U' r2' D' r U r' D r2 U r'",kind:"cmll"},{id:"pi_left_bar",alg:"U' R' U' R' F R F' R U' R' U2 R",kind:"cmll"},{id:"u_forward_slash",alg:"U2 R2 D R' U2 R D' R' U2 R'",kind:"cmll"},{id:"u_back_slash",alg:"R2' D' R U2 R' D R U2 R",kind:"cmll"},{id:"u_front_row",alg:"R2' F U' F U F2 R2 U' R' F R",kind:"cmll"},{id:"u_rows",alg:"U' F R2 D R' U R D' R2' U' F'",kind:"cmll"},{id:"u_x_checkerboard",alg:"U2 r U' r' U r' D' r U' r' D r",kind:"cmll"},{id:"u_back_row",alg:"U' F R U R' U' F'",kind:"cmll"},{id:"t_left_bar",alg:"U' R U R' U' R' F R F'",kind:"cmll"},{id:"t_right_bar",alg:"U L' U' L U L F' L' F",kind:"cmll"},{id:"t_rows",alg:"F R' F R2 U' R' U' R U R' F2",kind:"cmll"},{id:"t_front_row",alg:"r' U r U2' R2' F R F' R",kind:"cmll"},{id:"t_back_row",alg:"r' D' r U r' D r U' r U r'",kind:"cmll"},{id:"t_columns",alg:"U2 r2' D' r U r' D r2 U' r' U' r",kind:"cmll"},{id:"s_left_bar",alg:"U R U R' U R U2 R'",kind:"cmll"},{id:"s_x_checkerboard",alg:"U L' U2 L U2' L F' L' F",kind:"cmll"},{id:"s_forward_slash",alg:"U F R' F' R U2 R U2' R'",kind:"cmll"},{id:"s_Columns",alg:"U2 R' U' R U' R2' F' R U R U' R' F U2' R",kind:"cmll"},{id:"s_right_bar",alg:"U' R U R' U R' F R F' R U2' R'",kind:"cmll"},{id:"s_back_slash",alg:"U R U' L' U R' U' L",kind:"cmll"},{id:"as_right_bar",alg:"U R' U' R U' R' U2' R",kind:"cmll"},{id:"as_columns",alg:"U' R2 D R' U R D' R' U R' U' R U' R'",kind:"cmll"},{id:"as_back_slash",alg:"U' F' L F L' U2' L' U2 L",kind:"cmll"},{id:"as_x_checkerboard",alg:"U' R U2' R' U2 R' F R F'",kind:"cmll"},{id:"as_forward_slash",alg:"U' L' U R U' L U R'",kind:"cmll"},{id:"as_left_bar",alg:"U' R' U' R U' L U' R' U L' U2 R",kind:"cmll"},{id:"l_mirror",alg:"F R U' R' U' R U R' F'",kind:"cmll"},{id:"l_inverse",alg:"F R' F' R U R U' R'",kind:"cmll"},{id:"l_pure",alg:"R U2 R' U' R U R' U' R U R' U' R U' R'",kind:"cmll"},{id:"l_front_commutator",alg:"R U2 R D R' U2 R D' R2'",kind:"cmll"},{id:"l_diag",alg:"R' U' R U R' F' R U R' U' R' F R2",kind:"cmll"},{id:"l_back_commutator",alg:"U R' U2 R' D' R U2 R' D R2",kind:"cmll"}],Ne=[{id:"RUR'_1",alg:"R U R'",kind:"trigger"},{id:"RUR'_2",alg:"r U r'",kind:"trigger"},{id:"RU'R'_1",alg:"R U' R'",kind:"trigger"},{id:"RU'R'_2",alg:"r U' r'",kind:"trigger"},{id:"R'U'R_1",alg:"R' U' R",kind:"trigger"},{id:"R'U'R_2",alg:"r' U' r",kind:"trigger"},{id:"R'UR_1",alg:"R' U R",kind:"trigger"},{id:"R'UR_2",alg:"r' U r",kind:"trigger"}],Ye=[{id:"U",alg:"U",kind:"u_auf"},{id:"U'",alg:"U'",kind:"u_auf"},{id:"U2",alg:"U2",kind:"u_auf"},{id:"None",alg:"",kind:"u_auf"}],Me=["WG","WB","WO","WR","YG","YB","YO","YR","BW","BY","BO","BR","GW","GY","GO","GR","OW","OY","OB","OG","RW","RY","RB","RG"].map((function(e){return{id:e,alg:"",kind:"orientation"}})),Te=function(e){var t=function(e){switch(e){case"cmll":return Pe;case"trigger":return Ne;case"orientation":return Me;case"u_auf":return Ye;default:return[]}}(e.kind),n=new Set(function(e){for(var t=[],n=0;n<e.names.length;n++)e.flags[n]&&t.push(e.names[n]);return t}(e)),r=t.filter((function(e){var t=e.id.split("_",1)[0];return n.has(t)}));return function(){return 0===r.length?Ge:te(r)}};var Ae=function(){var e=Array(24).fill(0);return e[0]=1,{cmllSelector:{names:["o","s","as","t","l","u","pi","h"],flags:[1,1,1,1,1,1,1,1],kind:"cmll"},cmllAufSelector:{names:["None","U","U'","U2"],flags:[1,1,1,1],kind:"u_auf"},triggerSelector:{names:["RUR'","RU'R'","R'U'R","R'UR"],flags:[1,1,1,1],kind:"trigger"},orientationSelector:{names:["WG","WB","WO","WR","YG","YB","YO","YR","BW","BY","BO","BR","GW","GY","GO","GR","OW","OY","OB","OG","RW","RY","RB","RG"],flags:e,kind:"orientation"},fbdrSelector:{names:["FS at back","FS at front","Both"],flags:[1,0,0],kind:"fbdr"}}}(),Ie=function(){var e="config",t=null,n=function(){if(t)return t;var n=window.localStorage.getItem(e),r=window.localStorage.getItem("version");if(null===r||void 0===r||"0.2.1"!==r)return window.localStorage.setItem("version","0.2.1"),window.localStorage.setItem(e,JSON.stringify(Ae)),Ae;var a=n?JSON.parse(n):Ae;return null===a||void 0===a||0===Object.keys(a).length?(window.localStorage.setItem(e,JSON.stringify(Ae)),Ae):a};return{getConfig:n,setConfig:function(r){var a=Object.assign(n(),r);window.localStorage.setItem(e,JSON.stringify(a)),t=a}}}(),ze=Ie.getConfig,He=Ie.setConfig;var Xe={size:Math.pow(24,4)*Math.pow(24,2),encode:function(e){for(var t=0,n=0,r=0;r<8;r++)4===e.cp[r]?t=3*r+e.co[r]:5===e.cp[r]&&(n=3*r+e.co[r]);for(var a=24*t+n,o=0,c=0,i=0,l=0,u=0;u<12;u++)switch(e.ep[u]){case 5:o=2*u+e.eo[u];break;case 8:c=2*u+e.eo[u];break;case 9:i=2*u+e.eo[u];break;case 7:l=2*u+e.eo[u]}return a+576*(13824*o+576*c+24*i+l)},solved_states:[[],oe.parse("L R'"),oe.parse("L' R"),oe.parse("L2 R2")].map((function(e){return ae.apply(ae.id,e)})),max_depth:4,moveset:["U","U2","U'","F","F2","F'","R","R2","R'","r","r2","r'","D","D2","D'","M","M'","M2","B","B'","B2"].map((function(e){return oe.all[e]}))};function Je(e){var t,n,r,a,o=1e6,c=e.moveset,i=e.is_solved,l=e.pruners,u=0,s=0;function f(e,a,o,c){return t=c,n=o,r=a,u=0,s=0,m(e,0,[]),t}!function(e){e[e.CONTINUE=0]="CONTINUE",e[e.STOP=1]="STOP"}(a||(a={}));var d=Object.create({});function m(e,f,p){return++u>o?a.STOP:i(e)?function(e,n){if(n<r)return a.CONTINUE;if(t.solutions.length<t.capacity){var o=!0,c=!0,i=!1,l=void 0;try{for(var u,s=t.solutions[Symbol.iterator]();!(c=(u=s.next()).done);c=!0){var f=u.value;if(re(f,e)){o=!1;break}}}catch(d){i=!0,l=d}finally{try{c||null==s.return||s.return()}finally{if(i)throw l}}o&&t.solutions.push(Object(T.a)(e))}return t.solutions.length===t.capacity?a.STOP:a.CONTINUE}(p,f):f>=n?a.CONTINUE:l[0].query(e)+f>n?(s++,a.CONTINUE):function(e,t,n){var r=n.length>0?d[n[n.length-1].name]:c,o=new Set;o.add(l[0].encode(e));var i=!0,u=!1,s=void 0;try{for(var f,p=r[Symbol.iterator]();!(i=(f=p.next()).done);i=!0){var g=f.value,v=ae.apply(e,g),R=l[0].encode(v);if(!o.has(R)){o.add(R),n.push(g);var h=m(v,t+1,n);if(n.pop(),h===a.STOP)return a.STOP}}}catch(b){u=!0,s=b}finally{try{i||null==p.return||p.return()}finally{if(u)throw s}}return a.CONTINUE}(e,f,p)}return function(){function e(e){switch(e[0]){case"U":return c.filter((function(e){return"U"!==e.name[0]}));case"D":return c.filter((function(e){return"U"!==e.name[0]&&"D"!==e.name[0]}));case"R":var t=c.filter((function(e){return"R"!==e.name[0]&&"M"!==e.name[0]}));return"R"===e?t.filter((function(e){return"r'"!==e.name})):"R'"===e?t.filter((function(e){return"r"!==e.name})):"R2"===e?t.filter((function(e){return"r2"!==e.name})):t;case"L":case"r":case"M":return c.filter((function(e){return"R"!==e.name[0]&&"M"!==e.name[0]&&"L"!==e.name[0]&&"r"!==e.name[0]}));case"F":return c.filter((function(e){return"F"!==e.name[0]}));case"B":return c.filter((function(e){return"F"!==e.name[0]&&"B"!==e.name[0]}))}}var t=!0,n=!1,r=void 0;try{for(var a,o=c[Symbol.iterator]();!(t=(a=o.next()).done);t=!0){var i=a.value;d[i.name]=e(i.name)}}catch(l){n=!0,r=l}finally{try{t||null==o.return||o.return()}finally{if(n)throw r}}}(),{solve:function(e,t,n,r){for(var a={solutions:[],capacity:r},o=t;o<=n&&(a=f(e,t,o,a)).solutions.length!==a.capacity;o++);return console.log("Number of states = ".concat(u,", pruned = ").concat(s)),a.solutions},is_solved:i,getPruner:function(){return l}}}var qe=function(){var e=Xe,t=function(e){var t,n=e.size,r=e.encode,a=e.solved_states,o=e.max_depth,c=e.moveset,i=!1;return{init:function(){if(!i){i=!0,t=new Uint8Array(n).fill(255);var e=!0,l=!1,u=void 0;try{for(var s,f=a[Symbol.iterator]();!(e=(s=f.next()).done);e=!0){var d=s.value;t[r(d)]=0}}catch(x){l=!0,u=x}finally{try{e||null==f.return||f.return()}finally{if(l)throw u}}for(var m=Object(T.a)(a),p=m.length,g=0;g<o;g++){console.log("pruner: expanding depth ",g);var v=[],R=!0,h=!1,b=void 0;try{for(var U,y=m[Symbol.iterator]();!(R=(U=y.next()).done);R=!0){var O=U.value,_=!0,w=!1,k=void 0;try{for(var E,j=c[Symbol.iterator]();!(_=(E=j.next()).done);_=!0){var F=E.value,S=ae.apply(O,F),B=r(S);255===t[B]&&(t[B]=g+1,v.push(S))}}catch(x){w=!0,k=x}finally{try{_||null==j.return||j.return()}finally{if(w)throw k}}}}catch(x){h=!0,b=x}finally{try{R||null==y.return||y.return()}finally{if(h)throw b}}p+=(m=v).length}console.log("Initialization complete. size = ",p)}},query:function(e){var n=t[r(e)];return 255===n?o+1:n},equal:function(e,t){return r(e)===r(t)},encode:r}}(e);return t.init(),Je({is_solved:function(e){return 0===t.query(e)},moveset:e.moveset,pruners:[t]})},Ke=function(){var e=new Map;return{get:function(t){if(!e.has(t))switch(t){case"fbdr":e.set(t,qe())}return e.get(t)}}}();function Qe(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function Ve(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Qe(n,!0).forEach((function(t){Object(M.a)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Qe(n).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Ze=function(e){return e=e||"fbdr",{name:function(){switch(e){case"cmll":return"solved";case"fbdr":return"revealed"}}(),mode:e,cube:{state:ae.id,ori:"WG",history:[]},case:{state:ae.id,desc:[]},config:ze()}};function $e(e,t){if("key"===t.type)return function(e,t){if(""===t)return e;var n=et.create(e);return"#"===t[0]?n.control(t):n.move(t)}(e,t.content);if("config"===t.type)return He(t.content),Ve({},e,{config:ze()});if("mode"===t.type){var n=t.content;return e=Ze(n)}return e}var et=function(){function e(t){Object(Ce.a)(this,e),this.state=void 0,this.state=t}return Object(We.a)(e,null,[{key:"create",value:function(e){var t=e.mode;if("fbdr"===t)return new nt(e);if("cmll"===t){if("solving"===e.name)return new rt(e);if("solved"===e.name)return new at(e);throw new Error("Impossible")}throw new Error("Impossibe")}}]),e}(),tt=function(e){function t(){return Object(Ce.a)(this,t),Object(xe.a)(this,Object(De.a)(t).apply(this,arguments))}return Object(Le.a)(t,e),Object(We.a)(t,[{key:"control",value:function(e){var t=this.state,n=t.config,r=n.cmllSelector,a=n.triggerSelector,o=n.cmllAufSelector,c=n.orientationSelector,i=Te(r),l=Te(a),u=Te(o),s=Te(c);if("#enter"===e){var f=l(),d=i(),m=u(),p=f.alg+" "+m.alg+" "+d.alg,g=oe.inv(oe.parse(p)),v=se.get_random_lse();return Ve({},t,{name:"solving",cube:{state:v=ae.apply(v,g),ori:s().id,history:[]},case:{state:v,desc:[f,d]}})}if("#space"===e)return Ve({},t,{name:"solving",cube:Ve({},t.cube,{state:t.case.state,history:[]}),case:Ve({},t.case)});throw new Error("Unrecognized control code")}}]),t}(et),nt=function(e){function t(e){var n;return Object(Ce.a)(this,t),(n=Object(xe.a)(this,Object(De.a)(t).call(this,e))).solverName=void 0,n.solverL=void 0,n.solverR=void 0,n.solutionCap=void 0,n.getRandom=void 0,n.solverName="fbdr",n.getRandom=function(){var e=function(e){for(var t=[],n=0;n<e.flags.length;n++)1===e.flags[n]&&t.push(e.names[n]);return t}(n.state.config.fbdrSelector)[0];return console.log("active",e),"FS at back"===e?se.get_random_fs_back():"FS at front"===e?se.get_random_fs_front():te([se.get_random_fs_back,se.get_random_fs_front])()},n.solverL=8,n.solverR=10,n.solutionCap=5,n}return Object(Le.a)(t,e),t}(function(e){function t(){var e,n;Object(Ce.a)(this,t);for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];return(n=Object(xe.a)(this,(e=Object(De.a)(t)).call.apply(e,[this].concat(a)))).solverName=void 0,n.solverL=void 0,n.solverR=void 0,n.solutionCap=void 0,n.getRandom=void 0,n}return Object(Le.a)(t,e),Object(We.a)(t,[{key:"updateScramble",value:function(){var e=this.state,t=this.getRandom(),n=Ke.get(this.solverName),r=n.solve(t,this.solverL,this.solverR,1)[0],a=oe.to_string(oe.inv(r)),o=n.solve(t,0,this.solverR,2*this.solutionCap);o.sort((function(e,t){return oe.evaluate(e)-oe.evaluate(t)}));var c=oe.to_string(o[0]),i=o.slice(1,this.solutionCap).map((function(e){return oe.to_string(e)})),l={id:"".concat(this.solverName),alg:c,alt_algs:i,setup:a,kind:"fbdr"};return Ve({},e,{name:"hiding",cube:Ve({},e.cube,{state:t}),case:Ve({},e.case,{desc:[l]})})}},{key:"control",value:function(e){var t=this.state;return"#space"===e?"revealed"===t.name?this.updateScramble():Ve({},t,{name:"revealed"}):t}},{key:"move",value:function(e){var t=this.state,n=oe.parse(e)[0],r=ae.apply(t.cube.state,n);return Ve({},t,{cube:Ve({},t.cube,{state:r})})}}]),t}(et)),rt=function(e){function t(){return Object(Ce.a)(this,t),Object(xe.a)(this,Object(De.a)(t).apply(this,arguments))}return Object(Le.a)(t,e),Object(We.a)(t,[{key:"move",value:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}((function(e){var t=this.state,n=oe.parse(e);if(n.length>0){var r=n[0],a=ae.apply(t.cube.state,r),o=se.is_cmll_solved(a)?"solved":"solving";return Ve({},t,{cube:Ve({},t.cube,{state:ae.apply(t.cube.state,r),history:[].concat(Object(T.a)(t.cube.history),[r])}),name:o})}return t}))}]),t}(tt),at=function(e){function t(){return Object(Ce.a)(this,t),Object(xe.a)(this,Object(De.a)(t).apply(this,arguments))}return Object(Le.a)(t,e),Object(We.a)(t,[{key:"move",value:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}((function(e){return this.state}))}]),t}(tt);window.addEventListener("keydown",(function(e){32===e.keyCode&&e.target===document.body&&e.preventDefault()}));var ot=function(e){var t=o.a.useReducer($e,Ze()),n=Object(l.a)(t,2),r=n[0],a=n[1];return o.a.useEffect((function(){function e(e){var t=e.key;t=t.toUpperCase(),D.hasOwnProperty(t)&&a({type:"key",content:D[t]})}return window.addEventListener("keydown",e),function(){window.removeEventListener("keydown",e)}})),o.a.createElement(Be,{state:r,dispatch:a})};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var ct=n(99),it=n(98),lt=n(34),ut=n(47),st=Object(ut.a)({palette:{primary:{main:"#556cd6"},secondary:{main:"#19857b"},error:{main:lt.a.A400},background:{default:"#fff"}}});i.a.render(o.a.createElement(it.a,{theme:st},o.a.createElement(ct.a,null),o.a.createElement(ot,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[55,1,2]]]);
//# sourceMappingURL=main.0b919d9c.chunk.js.map