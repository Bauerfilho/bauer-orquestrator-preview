(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,46693,65016,e=>{"use strict";var t=e.i(43476),a=e.i(48787),o=e.i(65658),r=e.i(22016),i=e.i(71645),n=e.i(69378);e.s(["CineShell",0,({trackVh:e,children:s,fallback:l,tone:c="dark"})=>{let m="light"===c,d=(0,i.useRef)(null),[{p:u},h]=(0,o.useSpring)(()=>({p:0})),[f,p]=(0,i.useState)(!1),[x,v]=(0,i.useState)(!1);return((0,i.useEffect)(()=>{v(!0),p(window.matchMedia("(prefers-reduced-motion: reduce)").matches)},[]),x)?f?(0,t.jsx)(t.Fragment,{children:l}):(0,t.jsxs)("div",{ref:d,className:"relative",style:{height:`${e}vh`},children:[(0,t.jsxs)("div",{className:"sticky top-0 h-screen overflow-hidden bg-background text-foreground",children:[s(u),(0,t.jsx)("div",{className:`absolute left-0 top-0 z-[90] h-[3px] w-full ${m?"bg-[#232733]/15":"bg-glass-border"}`,children:(0,t.jsx)(a.animated.div,{className:m?"h-full bg-[#232733]":"h-full bg-foreground",style:{width:u.to(e=>`${100*e}%`)}})}),(0,t.jsxs)(a.animated.div,{className:"absolute right-[3vmin] top-[3vmin] z-[90] flex items-center gap-[1.4vmin]",style:{opacity:u.to(e=>e>.9?0:1),pointerEvents:u.to(e=>e>.9?"none":"auto")},children:[(0,t.jsx)("button",{type:"button",onClick:()=>{let e=d.current;if(!e)return;let t=e.offsetTop+e.offsetHeight-window.innerHeight,a=window.lenis;a?a.scrollTo(t,{duration:2.4}):window.scrollTo({top:t,behavior:"smooth"})},className:`min-h-11 rounded-btn border px-[clamp(1rem,2.4vmin,1.5rem)] text-[clamp(0.85rem,1.8vmin,1rem)] backdrop-blur-[10px] ${m?"border-[#232733]/20 bg-white/70 text-[#232733]":"border-glass-border bg-glass-dark text-foreground"}`,children:"pular →"}),(0,t.jsx)(r.default,{href:"/","aria-label":"Fechar apresentação",className:`flex min-h-11 min-w-11 items-center justify-center rounded-btn border text-[clamp(0.85rem,1.8vmin,1rem)] ${m?"border-[#232733]/20 text-[#232733]/70":"border-glass-border text-foreground/70"}`,children:"✕"})]}),(0,t.jsx)(a.animated.p,{"aria-hidden":"true",className:`absolute bottom-[3vmin] left-1/2 z-[90] m-0 -translate-x-1/2 text-[clamp(0.8rem,1.7vmin,0.95rem)] tracking-[0.18em] ${m?"text-[#232733]/50":"text-foreground/50"}`,style:{opacity:u.to(e=>Math.max(0,1-14*e))},children:"role para assistir ↓"})]}),(0,t.jsx)(n.ProgressTrigger,{tag:"span",trigger:d,start:"top top",end:"bottom bottom",className:"hidden",frameInterval:0,onChange:({progress:e})=>{h.start({p:e,immediate:!0})}})]}):(0,t.jsx)("div",{style:{height:`${e}vh`}})}],46693);let s=e=>e<0?0:e>1?1:e,l=e=>e*e*(3-2*e),c=(e,t,a)=>s((e-t)/(a-t));e.s(["ato",0,(e,t,a,o=.22)=>{let r=c(e,t,a);return r<=0||r>=1?0:Math.min(l(s(r/o)),l(s((1-r)/o)))},"letrasDoAto",0,(e,t,a=.22)=>(o,r,i)=>{let n=c(o,e,t),m=r/Math.max(i,1)*.4,d=1-l(s((s(n/a)-m)/.5)),u=1-l(s((1-n)/a));return{transform:`translateY(${70*d-40*u}%)`,filter:`blur(${(d+u)*1.6}vmin)`,opacity:Math.max(0,Math.min(1-1.2*d,1-1.4*u))}},"seg",0,c,"smooth",0,l],65016)},44447,e=>{"use strict";var t=e.i(43476),a=e.i(48787),o=e.i(57688),r=e.i(22016),i=e.i(71645);let n=`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,s=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // the head of the pointer chain, in the same space as uv
uniform vec2  iLag;            // one follower behind it
uniform vec2  iTail;           // and one behind that — about a second of history, no arrays
uniform float iEnergy;         // how disturbed the beam is: charges fast, releases over ~2 s
uniform float iIntro;          // 0 to 1 once the pointer is first seen, so nothing pops in

uniform vec3  uBgColor, uColorA, uColorB, uColorC, uColorD;
uniform float uSpeed, uAngle, uSweep, uOffset, uGlide;
uniform float uCoreW, uCoreAmt, uSpillK, uSpillAmt;
uniform float uReach, uFadeIn, uTail, uLightCurve, uFloorAmt;
uniform float uGrain, uDither, uVignette;
uniform float uPointerRadius, uTurn, uShift, uBloom, uParallax;

float hash1(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// four overlapping stops — never butt-jointed, or the ramp shows a crease
vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.38, t));
  c = mix(c, uColorC, smoothstep(0.34, 0.74, t));
  c = mix(c, uColorD, smoothstep(0.70, 1.00, t));
  return c;
}

float triDither(vec2 fc) { return (hash1(fc) + hash1(fc + 17.0) - 1.0) / 255.0; }

// ---- house grain. ONE look across the collection: an integer hash (no sin() streaks),
// triangular so it reads as film rather than static, weighted into the midtones so it
// never crusts a black or a white. Static by default; uGrainAnim re-seeds it 24\xd7/s.
uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  float t = iTime * uSpeed;

  /* the axis. It precesses on its own, and the hand adds a lean — atan() is taken on the
     LAGGED pole rather than the live one, so the angle it feeds is already smooth and the beam
     can never snap round when the pointer crosses the centre. */
  vec2 ml = iLag - iMouse * uParallax;
  float lean = uTurn * ml.x * iIntro * (0.55 + 0.45 * iEnergy);
  float a = uAngle + sin(t * 0.21) * uSweep + lean;
  vec2 dir = vec2(cos(a), sin(a));
  vec2 nrm = vec2(-dir.y, dir.x);

  // and where the axis sits: a slow glide, plus the hand pushing it broadside
  float off = uOffset + sin(t * 0.17 + 1.3) * uGlide + dot(ml, nrm) * uShift * iIntro;

  vec2 q = uv;
  float across = dot(q, nrm) - off;
  float along  = dot(q, dir);

  /* two widths, not one: the tight core is the shaft itself and the broad spill is the air
     around it. A single gaussian at this scale reads as an airbrushed stripe; the pair reads
     as a source, and the sum is what the colour is taken from. */
  float w = max(1e-3, uCoreW);
  float core = exp(-(across * across) / (w * w));
  float sw = w * uSpillK;
  float spill = exp(-(across * across) / (sw * sw));

  // the far end gives out — this is what makes the dark corner dark rather than merely dim
  float run = smoothstep(uFadeIn, uFadeIn + max(0.05, uReach), along);
  float fade = mix(1.0, run, clamp(uTail, 0.0, 1.0));

  float lit = (core * uCoreAmt + spill * uSpillAmt) * fade + uFloorAmt;
  lit = pow(clamp(lit, 0.0, 1.0), uLightCurve);

  // the hand carries a little light of its own, so slow circles over the dark side still pay
  vec2 d = uv - iLag;
  lit += exp(-dot(d, d) / max(1e-4, uPointerRadius * uPointerRadius))
       * uBloom * (0.35 + 0.65 * iEnergy) * iIntro;

  vec3 col = mix(uBgColor, ramp4(clamp(lit, 0.0, 1.0)), smoothstep(0.0, 0.05, lit) * 0.94 + 0.06);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,l={bgColor:"#04060f",colorA:"#2a0850",colorB:"#0e1c3e",colorC:"#ffffff",colorD:"#4a72d0",speed:.33,angle:2.24,sweep:.22,offset:-.26,glide:.12,coreW:.22,coreAmt:.62,spillK:3,spillAmt:.36,reach:1.6,fadeIn:-1.2,tail:.85,lightCurve:1.9,floorAmt:.02,grain:.034,grainAnim:0,dither:1.41,vignette:.12,cursor:1,pointerRadius:.9,turn:.5,shift:.35,bloom:.28,parallax:.02,maxDpr:1},c=new Set(["maxDpr","cursor"]);function m(e){return"u"+e[0].toUpperCase()+e.slice(1)}function d({className:e,active:a=!0,config:o}){let r=(0,i.useRef)(null),u=(0,i.useRef)(null),h=(0,i.useMemo)(()=>JSON.stringify(function(e,t){let a={...e};if(!t)return a;for(let o of Object.keys(e)){let e=t[o];typeof e==typeof a[o]&&(a[o]=e)}return a}(l,o)),[o]);return(0,i.useEffect)(()=>{let e=JSON.parse(h),t=r.current;if(!t)return;let a=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!a)return;let o=(e,t)=>{let o=a.createShader(e);return o?(a.shaderSource(o,t),a.compileShader(o),a.getShaderParameter(o,a.COMPILE_STATUS))?o:(console.error(a.getShaderInfoLog(o)),a.deleteShader(o),null):null},i=o(a.VERTEX_SHADER,n),l=o(a.FRAGMENT_SHADER,s),d=a.createProgram();if(!i||!l||!d)return;if(a.attachShader(d,i),a.attachShader(d,l),a.linkProgram(d),!a.getProgramParameter(d,a.LINK_STATUS))return void console.error(a.getProgramInfoLog(d));a.useProgram(d),a.bindVertexArray(a.createVertexArray());let f=new Map,p=e=>(f.has(e)||f.set(e,a.getUniformLocation(d,e)),f.get(e)??null),x=(e,t)=>a.uniform1f(p(e),t),v=(e,t,o)=>a.uniform2f(p(e),t,o);for(let t of Object.keys(e)){if(c.has(t))continue;let o=e[t];if("string"==typeof o){let e=function(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(255&t)/255]}(o);a.uniform3f(p(m(t)),e[0],e[1],e[2])}else x(m(t),o)}let g="number"==typeof e.maxDpr?e.maxDpr:1,b=1,w=()=>{b=Math.min(window.devicePixelRatio||1,g);let e=Math.max(1,Math.round((t.offsetWidth||window.innerWidth)*b)),o=Math.max(1,Math.round((t.offsetHeight||window.innerHeight)*b));(t.width!==e||t.height!==o)&&(t.width=e,t.height=o),a.viewport(0,0,e,o),a.useProgram(d),v("iResolution",e,o)};w();let y=!1,j=new ResizeObserver(()=>{y||(y=!0,requestAnimationFrame(()=>{y=!1,w()}))});j.observe(t);let S={tx:0,ty:0,hx:0,hy:0,mx:0,my:0,sx:0,sy:0,e:0},N=!1,A=null,C=e=>{let t=window.innerWidth/window.innerHeight;S.tx=(e.clientX/window.innerWidth-.5)*t,S.ty=.5-e.clientY/window.innerHeight,N||(N=!0,S.hx=S.mx=S.sx=S.tx,S.hy=S.my=S.sy=S.ty)};window.addEventListener("pointermove",C,{passive:!0}),window.addEventListener("pointerdown",C,{passive:!0});let k=performance.now(),E=0,R=0;return u.current=t=>{let o=t-k;if(k=t,document.hidden)return;let r=o>50?.05:o<4.167?.004167:.001*o;E+=r;let i=1-Math.exp(-5.6*r),n=1-Math.exp(-2.4*r),s=1-Math.exp(-1.15*r);S.hx+=(S.tx-S.hx)*i,S.hy+=(S.ty-S.hy)*i,S.mx+=(S.hx-S.mx)*n,S.my+=(S.hy-S.my)*n,S.sx+=(S.mx-S.sx)*s,S.sy+=(S.my-S.sy)*s;let l=S.hx-S.sx,c=S.hy-S.sy,m=Math.min(5.5*Math.sqrt(l*l+c*c),1);S.e+=(m-S.e)*(1-Math.exp(-(m>S.e?4.5:.42)*r)),R+=(!!N-R)*(1-Math.exp(-3*r)),a.useProgram(d),x("iTime",E),null===A&&(A={x:S.tx,y:S.ty}),e.cursor||(S.tx=A.x,S.ty=A.y),x("iIntro",R),x("iEnergy",S.e),v("iMouse",S.hx,S.hy),v("iLag",S.mx,S.my),v("iTail",S.sx,S.sy),a.drawArrays(a.TRIANGLES,0,3)},a.drawArrays(a.TRIANGLES,0,3),()=>{u.current=null,j.disconnect(),window.removeEventListener("pointermove",C),window.removeEventListener("pointerdown",C),a.deleteProgram(d),a.deleteShader(i),a.deleteShader(l),a.getExtension("WEBGL_lose_context")?.loseContext()}},[h]),(0,i.useEffect)(()=>{if(!a)return;let e=0,t=a=>{e=requestAnimationFrame(t),u.current?.(a)};return e=requestAnimationFrame(t),()=>cancelAnimationFrame(e)},[a,h]),(0,t.jsx)("canvas",{ref:r,className:e})}var u=e.i(16867),h=e.i(88880),f=e.i(46693),p=e.i(65016);let x="/apresentacao/telas",v=[{c:"/goal",d:"enunciar o objetivo"},{c:"/plan",d:"a frota planeja junta"},{c:"/decidi",d:"decisão que todas obedecem"}],g=["8 módulos","14 IAs","31 ícones"],b=[{img:`${x}/05-chegada-ao-vivo.png`,titulo:"Chegada ao vivo",sub:"Cada braço reporta na sala em tempo real."},{img:`${x}/06-decisoes-vigentes.png`,titulo:"Decisões vigentes",sub:"O que foi decidido fica escrito, datado e vivo."},{img:`${x}/11-celular-depois.png`,titulo:"No bolso",sub:"A mesma sala, no celular, do plantão ao sofá."}],w=({p:e})=>(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(a.animated.div,{className:"absolute inset-[-8%]",style:{transform:e.to(e=>`rotate(${-2.5+5*e}deg) scale(1.06)`)},children:(0,t.jsx)(d,{className:"absolute inset-0 size-full",active:!0})}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[10] flex flex-col items-center justify-center gap-[2.4vmin] text-center",style:{opacity:e.to(e=>e>.15?0:1),pointerEvents:"none"},children:[(0,t.jsx)("h1",{className:"m-0 whitespace-nowrap text-[clamp(2.6rem,10vmin,8rem)] font-normal leading-[0.95]",children:(0,t.jsx)(h.ScrollLetters,{text:"Orquestrator App",p:e,styleFn:(0,p.letrasDoAto)(.005,.15,.5)})}),(0,t.jsx)(a.animated.p,{className:"m-0 max-w-[56ch] text-[clamp(1rem,2.4vmin,1.35rem)] leading-snug text-foreground/70",style:{opacity:e.to(e=>(0,p.ato)(e,.02,.15,.35))},children:"14 IAs. Uma sala. Um comando — e o julgamento continua humano."}),(0,t.jsx)(a.animated.span,{className:"rounded-btn bg-[#12110C] px-[2vmin] py-[1vmin] text-[clamp(0.8rem,1.7vmin,1rem)] tracking-[0.08em] text-[#D4AF37]",style:{opacity:e.to(e=>(0,p.ato)(e,.035,.15,.4))},children:"o nosso maior forte"})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[11] [perspective:1400px]",style:{opacity:e.to(e=>(0,p.ato)(e,.13,.33,.18)),pointerEvents:"none"},children:[(0,t.jsx)(a.animated.div,{className:"absolute left-1/2 top-1/2 w-[min(78vw,120vmin)] overflow-hidden rounded-card border border-glass-border",style:{transform:e.to(e=>{let t=(0,p.smooth)((0,p.seg)(e,.13,.23));return`translate(-50%, ${-50+(1-t)*42}%) rotateX(${(1-t)*24}deg) scale(${.78+.22*t})`})},children:(0,t.jsx)(o.default,{src:`${x}/01-sala-palha.png`,alt:"A sala do Orquestrator",width:1888,height:1080,priority:!0,className:"h-auto w-full"})}),(0,t.jsxs)(a.animated.div,{className:"absolute bottom-[7vmin] left-[6vmin] max-w-[44ch]",style:{opacity:e.to(e=>(0,p.ato)(e,.17,.33,.3)),transform:e.to(e=>`translateY(${(1-(0,p.smooth)((0,p.seg)(e,.17,.25)))*36}px)`)},children:[(0,t.jsx)("h2",{className:"m-0 text-[clamp(1.8rem,5vmin,3.6rem)] font-normal leading-[1]",children:"A sala"}),(0,t.jsx)("p",{className:"m-0 mt-[1vmin] text-[clamp(0.95rem,2.1vmin,1.2rem)] leading-snug text-foreground/75",children:"IAs que não se veem conversam por um único canal — aberto para quem chegar."})]}),(0,t.jsx)("div",{className:"absolute bottom-[7vmin] right-[6vmin] flex flex-col gap-[1vmin] max-sm:hidden",children:v.map((o,r)=>(0,t.jsxs)(a.animated.div,{className:"flex items-center gap-[1.4vmin] rounded-btn border border-glass-border bg-glass-dark px-[1.8vmin] py-[1vmin] backdrop-blur-[10px]",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.19+.03*r,.23+.03*r))*(0,p.ato)(e,.13,.33,.14)),transform:e.to(e=>`translateY(${(1-(0,p.smooth)((0,p.seg)(e,.19+.03*r,.23+.03*r)))*24}px)`)},children:[(0,t.jsx)("span",{className:"font-mono text-[clamp(0.85rem,1.9vmin,1.05rem)] text-[#D4AF37]",children:o.c}),(0,t.jsx)("span",{className:"text-[clamp(0.8rem,1.7vmin,0.95rem)] text-foreground/70",children:o.d})]},o.c))})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[12] flex flex-col items-start justify-end gap-[1.8vmin] p-[7vmin] pb-[10vmin]",style:{opacity:e.to(e=>(0,p.ato)(e,.31,.45,.24))},children:[(0,t.jsx)(a.animated.div,{className:"absolute right-[6vmin] top-1/2 w-[38vw] max-w-[52vmin] overflow-hidden rounded-card border border-glass-border max-sm:hidden",style:{transform:e.to(e=>`translateY(${-50+(1-(0,p.smooth)((0,p.seg)(e,.31,.39)))*18}%) rotate(${2-4*(0,p.smooth)((0,p.seg)(e,.31,.45))}deg)`)},children:(0,t.jsx)(o.default,{src:`${x}/03-comandos-do-dono.png`,alt:"",width:1888,height:1080,className:"h-auto w-full opacity-90"})}),(0,t.jsx)("p",{className:"m-0 text-[clamp(0.8rem,1.7vmin,0.95rem)] uppercase tracking-[0.22em] text-foreground/50",children:"checkpoint"}),(0,t.jsx)("h2",{className:"m-0 max-w-[14ch] text-[clamp(2rem,6vmin,4.6rem)] font-normal leading-[1]",children:"Sem tempo para o filme?"}),(0,t.jsx)("div",{style:{pointerEvents:"auto"},children:(0,t.jsx)(r.default,{href:"/orquestrator-app/",className:"inline-flex min-h-11 items-center justify-center rounded-btn bg-paper px-[clamp(1.6rem,4vmin,2.4rem)] py-[clamp(0.9rem,2vmin,1.2rem)] text-[clamp(0.95rem,2.1vmin,1.2rem)] leading-none text-ink",children:"conhecer o App agora →"})})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[13]",style:{opacity:e.to(e=>(0,p.ato)(e,.43,.65,.16)),pointerEvents:"none"},children:[(0,t.jsxs)("div",{className:"absolute left-[6vmin] top-[8vmin]",children:[(0,t.jsx)("p",{className:"m-0 text-[clamp(0.8rem,1.7vmin,0.95rem)] uppercase tracking-[0.22em] text-foreground/50",children:"/ o dossiê"}),(0,t.jsx)("h2",{className:"m-0 mt-[0.6vmin] text-[clamp(1.8rem,5vmin,3.8rem)] font-normal leading-[1]",children:"Oito módulos, um deck."})]}),(0,t.jsx)("div",{className:"absolute right-[6vmin] top-[8.6vmin] flex gap-[1.4vmin] max-sm:hidden",children:g.map((o,r)=>(0,t.jsx)(a.animated.span,{className:"rounded-btn border border-glass-border bg-glass-dark px-[1.6vmin] py-[0.8vmin] text-[clamp(0.8rem,1.7vmin,0.95rem)] text-foreground/85 backdrop-blur-[10px]",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.48+.03*r,.52+.03*r))*(0,p.ato)(e,.43,.65,.14))},children:o},o))}),(0,t.jsx)(a.animated.div,{className:"absolute top-1/2 flex -translate-y-[38%] gap-[4vmin] pl-[8vmin]",style:{transform:e.to(e=>`translateY(-38%) translateX(${(1-(0,p.seg)(e,.43,.65))*55-38}vw)`)},children:b.map((e,a)=>(0,t.jsxs)("div",{className:"w-[46vmin] shrink-0",style:{transform:`rotate(${(a-1)*1.6}deg)`},children:[(0,t.jsx)("div",{className:"overflow-hidden rounded-card border border-glass-border",children:(0,t.jsx)(o.default,{src:e.img,alt:"",width:1888,height:1080,className:"h-auto w-full"})}),(0,t.jsx)("h3",{className:"m-0 mt-[1.4vmin] text-[clamp(1.1rem,2.4vmin,1.5rem)] font-normal",children:e.titulo}),(0,t.jsx)("p",{className:"m-0 text-[clamp(0.85rem,1.8vmin,1.05rem)] text-foreground/65",children:e.sub})]},e.titulo))})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[14]",style:{opacity:e.to(e=>(0,p.ato)(e,.63,.78,.2)),pointerEvents:"none"},children:[(0,t.jsx)(a.animated.div,{className:"orq-malha absolute inset-0",style:{opacity:e.to(e=>.9*(0,p.smooth)((0,p.seg)(e,.63,.68)))}}),(0,t.jsx)(a.animated.div,{className:"absolute inset-0",style:{transform:e.to(e=>`scale(${1.12-.12*(0,p.smooth)((0,p.seg)(e,.63,.78))})`),opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.66,.72)))},children:(0,t.jsx)(o.default,{src:`${x}/14-iaswarm-neon.png`,alt:"",fill:!0,sizes:"100vw",className:"object-cover opacity-60"})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/40"}),(0,t.jsxs)("div",{className:"absolute bottom-[8vmin] left-[6vmin] flex max-w-[46ch] flex-col gap-[1.4vmin]",children:[(0,t.jsx)("span",{className:"w-fit rounded-btn bg-[#12110C] px-[1.8vmin] py-[0.9vmin] text-[clamp(0.75rem,1.6vmin,0.95rem)] tracking-[0.08em] text-[#D4AF37]",children:"feito em casa, peça por peça"}),(0,t.jsx)("h2",{className:"m-0 text-[clamp(2.2rem,6.4vmin,5rem)] font-normal leading-[0.95]",children:"O enxame"}),(0,t.jsx)("p",{className:"m-0 text-[clamp(0.95rem,2.1vmin,1.2rem)] leading-snug text-foreground/75",children:"iaswarm: uma missão vira dezenas de braços em paralelo — e um só relatório. O julgamento permanece um."})]})]}),(0,t.jsx)(a.animated.div,{"aria-hidden":"true",className:"absolute inset-0 z-[18] bg-background",style:{transform:e.to(e=>`translateY(${(1-2*(0,p.seg)(e,.735,.795))*100}%)`)}}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[20] flex items-center justify-center",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.76,.76+.06))),pointerEvents:e.to(e=>e>.8?"auto":"none")},children:[(0,t.jsx)(a.animated.div,{"aria-hidden":"true",className:"pointer-events-none absolute top-[16vh] z-[22]",style:{opacity:e.to(e=>Math.max(0,(0,p.ato)(e,.78,.92,.3)))},children:(0,t.jsx)(u.Bell,{tamanho:"6vmin"})}),(0,t.jsx)(a.animated.h2,{"aria-hidden":"true",className:"pointer-events-none absolute z-[21] m-0 whitespace-nowrap text-[clamp(2rem,8vmin,6.4rem)] font-normal text-foreground",style:{opacity:e.to(e=>Math.max(0,(0,p.ato)(e,.76,.9,.3))),transform:e.to(e=>`translateY(${-(12*(0,p.smooth)((0,p.seg)(e,.76,.9)))}vh)`)},children:"A casa espera por você."}),(0,t.jsxs)(a.animated.a,{href:"/orquestrator-app/","aria-label":"Entrar no Orquestrator App",className:"relative block overflow-hidden border border-glass-border",style:{width:"80vw",aspectRatio:"16/10",borderRadius:e.to(e=>`${(1-(0,p.seg)(e,.84,.98))*2.4}vmin`),transform:e.to(e=>`scale(${.34+.92*(0,p.smooth)((0,p.seg)(e,.78,.985))})`),boxShadow:"0 30px 120px rgba(102,153,255,0.18)"},children:[(0,t.jsx)(o.default,{src:"/apresentacao/previews/app.png",alt:"A página do Orquestrator App",fill:!0,sizes:"80vw",className:"object-cover object-top"}),(0,t.jsx)(a.animated.span,{className:"absolute inset-x-0 bottom-0 flex justify-center pb-[4vmin]",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.9,.97)))},children:(0,t.jsx)("span",{className:"inline-flex min-h-11 items-center justify-center rounded-btn bg-paper px-[clamp(1.8rem,4.6vmin,2.8rem)] py-[clamp(1rem,2.2vmin,1.4rem)] text-[clamp(1rem,2.3vmin,1.3rem)] leading-none text-ink",children:"entrar no Orquestrator App →"})})]})]})]}),y=()=>(0,t.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center gap-[3vmin] bg-background p-[8vmin] text-center text-foreground",children:[(0,t.jsx)("h1",{className:"m-0 text-[clamp(2.4rem,8vmin,6rem)] font-normal leading-[0.95]",children:"Orquestrator App"}),(0,t.jsx)("p",{className:"m-0 max-w-[56ch] text-[clamp(1rem,2.3vmin,1.3rem)] text-foreground/70",children:"Um cérebro, uma frota de IAs — terminal, web, chat, groupchat, swarm, painel e mail, com o julgamento sempre humano."}),(0,t.jsx)(r.default,{href:"/orquestrator-app/",className:"inline-flex min-h-11 items-center justify-center rounded-btn bg-paper px-[2.4rem] py-[1.1rem] leading-none text-ink",children:"conhecer o App →"})]});e.s(["FilmeApp",0,()=>(0,t.jsx)(f.CineShell,{trackVh:760,fallback:(0,t.jsx)(y,{}),children:e=>(0,t.jsx)(w,{p:e})})],44447)},29993,e=>{"use strict";var t=e.i(43476),a=e.i(48787),o=e.i(57688),r=e.i(22016),i=e.i(71645);let n=`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,s=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // aspect-corrected units, same space as uv — the body node
uniform vec2  iMouseVel;       // lead node minus body node — a velocity proxy
uniform vec2  iMouseWake;      // a third, much slower node — the tail of the trail

uniform vec3  uBgColor, uColorA, uColorB, uColorC, uColorD;
uniform float uScale, uSpeed, uFlow, uRoughness, uLacunarity;
uniform float uSmokeScale, uCurl, uCurlScale, uRise, uSlender;
uniform float uWidth, uSpread, uLean, uDensity;
uniform float uContrast, uMidpoint, uGlow, uSink;
uniform float uGrain, uDither, uVignette;
uniform float uPointerRadius, uDraft, uPointerStrength, uParallax;
#define OCTAVES 3
#define TRAIL_TAPS 6
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

/* A mix-based cell hash rather than the fract(sin()) one. sin() hashing is
   correlated along the diagonal, and a jittered grid seeded from it lays its
   cells out in faint rows the eye finds immediately. */
float hash1(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}
/* The trail. The shader has no memory, so the tail is reconstructed from three
   pointer nodes: TRAIL_TAPS gaussians strung along the segment between the slow
   wake node and the body node, weighted toward the head. A resting cursor puts
   every tap in the same place and the result is one clean gaussian; a moving one
   stretches them into a tapered ribbon that melts away from the back as the wake
   catches up. No branch, no jump, and the same falloff at every point along it. */
float trail(vec2 uv, float radius) {
  /* The sample point is wobbled by a slow field first. A gaussian is a perfect
     circle, and a perfect circle parked under a resting cursor is the one thing
     that reads as drawn rather than felt; warping the coordinate by a fraction
     of the radius makes the touch an organic patch that breathes, for two noise
     taps and nothing else. */
  vec2 wob = vec2(snoise(uv * 1.7 + vec2(0.0, iTime * 0.05)),
                  snoise(uv * 1.7 + vec2(4.3, -iTime * 0.04)));
  uv += wob * radius * 0.18;
  float a = 0.0, wsum = 0.0;
  float r2 = max(1e-4, radius * radius);
  for (int i = 0; i < TRAIL_TAPS; i++) {
    float k = float(i) / float(TRAIL_TAPS - 1);
    vec2 c = mix(iMouseWake, iMouse, k);
    vec2 dd = uv - c;
    float w = mix(0.30, 1.0, k);
    a += w * exp(-dot(dd, dd) / r2);
    wsum += w;
  }
  return a / wsum;
}
/* The curl of a scalar potential — the cheapest divergence-free flow there is.
   Rotating the gradient of a noise field by ninety degrees gives a velocity field
   that can never pile up on itself, which is exactly what a plain domain warp
   gets wrong: a warp bunches smoke into knots, a curl folds it. Two octaves of
   potential, four taps for the two derivatives — eight noise evaluations for a
   flow field that behaves. */
float potential(vec2 p) {
  return snoise(p) + 0.5 * snoise(p * 2.03 + vec2(3.7, -1.9));
}

vec2 curl(vec2 p, float e) {
  float nx1 = potential(p + vec2(0.0, e));
  float nx2 = potential(p - vec2(0.0, e));
  float ny1 = potential(p + vec2(e, 0.0));
  float ny2 = potential(p - vec2(e, 0.0));
  return vec2(nx1 - nx2, ny2 - ny1) / (2.0 * e);
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

// triangular-PDF dither — the only reliable cure for 8-bit gradient banding
float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

// ---- house grain. ONE look across the collection: an integer hash (no sin() streaks),
// triangular so it reads as film rather than static, weighted into the midtones so it
// never crusts a black or a white. Static by default; uGrainAnim re-seeds it 24\xd7/s.
uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  float t = iTime * uSpeed;

  float tr = trail(uv, uPointerRadius);

  vec2 p = (uv - iMouse * uParallax) * uScale;

  // the column rises: the whole field is sampled in a frame that slides down past
  // it, so the smoke climbs without the frame ever moving
  vec2 sp = p + vec2(0.0, -t * uRise);

  // the flow that carries it, plus the draught the hand puts into the room. The
  // hand's travel is added to the VELOCITY field rather than to the coordinate,
  // so it folds the smoke the way a real draught does instead of sliding a patch
  // of it sideways — and it keeps blowing for a beat after the hand stops,
  // because the wake node behind the trail is still catching up
  vec2 c = curl(sp * uCurlScale + vec2(0.0, t * uFlow), 0.14) * uCurl;
  c += iMouseVel * uDraft * tr;

  // the smoke itself, stretched vertically: a column is taller than it is wide
  vec2 mp = vec2(sp.x, sp.y * uSlender) * uSmokeScale + c;
  float dens = fbm(mp) * 0.5 + 0.5;

  // the corridor the column climbs, leaning toward the pointer and widening as it
  // goes — the lean is weighted by height, so the base stays put and the top
  // swings, which is how a plume answers a draught
  float h = uv.y + 0.55;
  float lean = iMouse.x * uLean * clamp(h, 0.0, 1.6);
  float width = max(0.06, uWidth * (0.45 + uSpread * clamp(h, 0.0, 1.8)));
  float xr = (uv.x - lean) / width;
  float corridor = exp(-xr * xr);

  // and it thins as it cools on the way up
  float cool = smoothstep(-0.65, 0.85, uv.y);
  float smoke = dens * corridor * mix(1.0, 0.30, cool) * uDensity;

  // and the stirred air carries a little more of it — an exposure lift, not a
  // shape, so there is nothing following the cursor to point at
  float f = clamp((smoke - uMidpoint) * uContrast + 0.5 + tr * uPointerStrength * 0.30, 0.0, 1.0);

  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBgColor, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);
  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,l={bgColor:"#f8eff2",colorA:"#eabfcf",colorB:"#df8ba9",colorC:"#ca6284",colorD:"#aa4463",scale:.2,speed:.33,flow:.04,roughness:.36,lacunarity:2.55,smokeScale:2.51,curl:.36,curlScale:.88,rise:.03,slender:1.55,width:1.55,spread:1.11,lean:1.25,density:2.15,contrast:1.7,midpoint:.76,glow:.53,sink:.2,grain:.12,grainAnim:0,dither:1.1,vignette:.26,cursor:1,pointerRadius:.84,draft:1.85,pointerStrength:.16,parallax:.028,maxDpr:1},c={bgColor:"#120a0d",colorA:"#3a0f1d",colorB:"#8c1b3a",colorC:"#c73657",colorD:"#e0b06a",scale:.2,speed:.33,flow:.035,roughness:.36,lacunarity:1.81,smokeScale:1.82,curl:.2,curlScale:.49,rise:.05,slender:2,width:2,spread:1.31,lean:.91,density:2.05,contrast:1.64,midpoint:.77,glow:.56,sink:.17,grain:0,grainAnim:0,dither:1.24,vignette:.28,cursor:1,pointerRadius:.76,draft:1.5,pointerStrength:.29,parallax:.008,maxDpr:1},m=new Set(["maxDpr","cursor"]);function d(e){return"u"+e[0].toUpperCase()+e.slice(1)}function u({className:e,active:a=!0,config:o}){let r=(0,i.useRef)(null),c=(0,i.useRef)(null),h=(0,i.useMemo)(()=>JSON.stringify(function(e,t){let a={...e};if(!t)return a;for(let o of Object.keys(e)){let e=t[o];typeof e==typeof a[o]&&(a[o]=e)}return a}(l,o)),[o]);return(0,i.useEffect)(()=>{let e=JSON.parse(h),t=r.current;if(!t)return;let a=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!a)return;let o=(e,t)=>{let o=a.createShader(e);return o?(a.shaderSource(o,t),a.compileShader(o),a.getShaderParameter(o,a.COMPILE_STATUS))?o:(console.error(a.getShaderInfoLog(o)),a.deleteShader(o),null):null},i=o(a.VERTEX_SHADER,n),l=o(a.FRAGMENT_SHADER,s),u=a.createProgram();if(!i||!l||!u)return;if(a.attachShader(u,i),a.attachShader(u,l),a.linkProgram(u),!a.getProgramParameter(u,a.LINK_STATUS))return void console.error(a.getProgramInfoLog(u));a.useProgram(u),a.bindVertexArray(a.createVertexArray());let f=new Map,p=e=>(f.has(e)||f.set(e,a.getUniformLocation(u,e)),f.get(e)??null),x=(e,t)=>a.uniform1f(p(e),t),v=(e,t,o)=>a.uniform2f(p(e),t,o);for(let t of Object.keys(e)){if(m.has(t))continue;let o=e[t];if("string"==typeof o){let e=function(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(255&t)/255]}(o);a.uniform3f(p(d(t)),e[0],e[1],e[2])}else x(d(t),o)}let g="number"==typeof e.maxDpr?e.maxDpr:1,b=1,w=()=>{b=Math.min(window.devicePixelRatio||1,g);let e=Math.max(1,Math.round((t.offsetWidth||window.innerWidth)*b)),o=Math.max(1,Math.round((t.offsetHeight||window.innerHeight)*b));(t.width!==e||t.height!==o)&&(t.width=e,t.height=o),a.viewport(0,0,e,o),a.useProgram(u),v("iResolution",e,o)};w();let y=!1,j=new ResizeObserver(()=>{y||(y=!0,requestAnimationFrame(()=>{y=!1,w()}))});j.observe(t);let S={x:0,y:0,ax:0,ay:0,wx:0,wy:0,tx:0,ty:0},N=null,A=e=>{let t=window.innerWidth/window.innerHeight;S.tx=(e.clientX/window.innerWidth-.5)*t,S.ty=.5-e.clientY/window.innerHeight};window.addEventListener("pointermove",A,{passive:!0}),window.addEventListener("pointerdown",A,{passive:!0});let C=performance.now(),k=0;return c.current=t=>{let o=t-C;if(C=t,document.hidden)return;let r=o>50?50:o<4.167?4.167:o,i=r>36.7?2.2:.06*r;k+=.001*r;let n=.105*i,s=.043*i,l=.017*i;S.ax+=(S.tx-S.ax)*n,S.ay+=(S.ty-S.ay)*n,S.x+=(S.ax-S.x)*s,S.y+=(S.ay-S.y)*s,S.wx+=(S.x-S.wx)*l,S.wy+=(S.y-S.wy)*l,a.useProgram(u),x("iTime",k),null===N&&(N={x:S.tx,y:S.ty}),e.cursor||(S.tx=N.x,S.ty=N.y),v("iMouse",S.x,S.y),v("iMouseVel",S.ax-S.x,S.ay-S.y),v("iMouseWake",S.wx,S.wy),a.drawArrays(a.TRIANGLES,0,3)},a.drawArrays(a.TRIANGLES,0,3),()=>{c.current=null,j.disconnect(),window.removeEventListener("pointermove",A),window.removeEventListener("pointerdown",A),a.deleteProgram(u),a.deleteShader(i),a.deleteShader(l),a.getExtension("WEBGL_lose_context")?.loseContext()}},[h]),(0,i.useEffect)(()=>{if(!a)return;let e=0,t=a=>{e=requestAnimationFrame(t),c.current?.(a)};return e=requestAnimationFrame(t),()=>cancelAnimationFrame(e)},[a,h]),(0,t.jsx)("canvas",{ref:r,className:e})}var h=e.i(88880),f=e.i(46693),p=e.i(65016);let x="/apresentacao/telas-mentor-dark",v=({p:e})=>(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"absolute inset-0",children:(0,t.jsx)(u,{className:"absolute inset-0 size-full",active:!0,config:c})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-gradient-to-t from-[#120a0d]/70 via-transparent to-[#120a0d]/40"}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[10] flex flex-col items-center justify-center gap-[2.4vmin] text-center",style:{opacity:e.to(e=>e>.14?0:1),pointerEvents:"none"},children:[(0,t.jsx)("h1",{className:"m-0 whitespace-nowrap text-[clamp(2.6rem,10vmin,8rem)] font-normal leading-[0.95] text-[#e9cca6]",children:(0,t.jsx)(h.ScrollLetters,{text:"Mentor Bauer",p:e,styleFn:(0,p.letrasDoAto)(.005,.14,.5)})}),(0,t.jsx)(a.animated.p,{className:"m-0 max-w-[54ch] text-[clamp(1rem,2.4vmin,1.35rem)] leading-snug text-[#fffaf4]/75",style:{opacity:e.to(e=>(0,p.ato)(e,.02,.14,.35))},children:"Um mentor pessoal para a residência — rotina, estudo e clínica no mesmo bolso."}),(0,t.jsx)(a.animated.span,{className:"rounded-btn border border-[#c79751]/40 bg-[#1a0d12]/80 px-[2vmin] py-[1vmin] text-[clamp(0.8rem,1.7vmin,1rem)] tracking-[0.08em] text-[#e0b06a]",style:{opacity:e.to(e=>(0,p.ato)(e,.035,.14,.4))},children:"padrões explicáveis, não um placar"})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[11]",style:{opacity:e.to(e=>(0,p.ato)(e,.12,.34,.18))},children:[(0,t.jsx)(a.animated.div,{className:"absolute right-[8vw] top-1/2 w-[min(44vmin,80vw)] max-sm:left-1/2 max-sm:right-auto max-sm:w-[70vw]",style:{transform:e.to(e=>{let t=(0,p.smooth)((0,p.seg)(e,.12,.24));return`translateY(${-46+(1-t)*50}%) rotate(${(1-t)*4}deg) translateX(0%)`})},children:(0,t.jsx)(o.default,{src:`${x}/pub-dark-hoje.png`,alt:"A tela Hoje do Mentor em modo escuro",width:780,height:1700,priority:!0,className:"h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"})}),(0,t.jsxs)("div",{className:"absolute bottom-[9vmin] left-[6vmin] flex max-w-[42ch] flex-col gap-[1.4vmin]",children:[(0,t.jsx)("h2",{className:"m-0 text-[clamp(2rem,5.6vmin,4.2rem)] font-normal leading-[1] text-[#fffaf4]",children:"O dia inteiro, com folga cognitiva"}),(0,t.jsx)("p",{className:"m-0 text-[clamp(0.95rem,2.1vmin,1.2rem)] leading-snug text-[#fffaf4]/70",children:"Plantão, escala, essenciais e um check-in gentil — o app pergunta pouco e guarda tudo."}),(0,t.jsx)("div",{style:{pointerEvents:"auto"},children:(0,t.jsx)(r.default,{href:"/mentor/",className:"mt-[0.6vmin] inline-flex min-h-11 items-center justify-center rounded-btn bg-[#e9cca6] px-[clamp(1.4rem,3.6vmin,2.2rem)] py-[clamp(0.8rem,1.8vmin,1.2rem)] text-[clamp(0.95rem,2vmin,1.15rem)] leading-none text-[#3a0f1d]",children:"conhecer o Mentor sem o filme →"})})]})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[12]",style:{opacity:e.to(e=>(0,p.ato)(e,.32,.56,.18)),pointerEvents:"none"},children:[(0,t.jsxs)("div",{className:"absolute left-1/2 top-[7vmin] w-full max-w-[70ch] -translate-x-1/2 px-[4vmin] text-center",children:[(0,t.jsx)("h2",{className:"m-0 text-[clamp(1.8rem,5vmin,3.8rem)] font-normal leading-[1] text-[#fffaf4]",children:"Um gesto de cada vez"}),(0,t.jsx)("p",{className:"m-0 mt-[1vmin] text-[clamp(0.9rem,2vmin,1.15rem)] text-[#fffaf4]/70",children:"Registro, agenda, calculadoras de plantão — cada área pergunta apenas o que precisa saber."})]}),(0,t.jsx)(a.animated.div,{className:"absolute left-[16vw] top-1/2 w-[min(38vmin,64vw)] max-sm:left-[4vw]",style:{transform:e.to(e=>{let t=(0,p.smooth)((0,p.seg)(e,.32,.46));return`translateY(${-38+(1-t)*40}%) rotate(${-7+3*t}deg) translateX(${-((1-t)*30)}%)`})},children:(0,t.jsx)(o.default,{src:`${x}/pub-dark-registrar.png`,alt:"A aba Registrar em modo escuro",width:780,height:1700,className:"h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"})}),(0,t.jsx)(a.animated.div,{className:"absolute right-[16vw] top-1/2 w-[min(38vmin,64vw)] max-sm:right-[4vw]",style:{transform:e.to(e=>{let t=(0,p.smooth)((0,p.seg)(e,.37,.51));return`translateY(${-52+(1-t)*46}%) rotate(${7-3*t}deg) translateX(${(1-t)*30}%)`})},children:(0,t.jsx)(o.default,{src:`${x}/pub-dark-agenda.png`,alt:"A Agenda em modo escuro",width:780,height:1700,className:"h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"})})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[13]",style:{opacity:e.to(e=>(0,p.ato)(e,.54,.74,.2)),pointerEvents:"none"},children:[(0,t.jsx)(a.animated.div,{className:"absolute left-1/2 top-1/2 w-[min(46vmin,78vw)]",style:{transform:e.to(e=>`translate(-50%, -50%) scale(${.94+.1*(0,p.smooth)((0,p.seg)(e,.54,.74))})`)},children:(0,t.jsx)(o.default,{src:`${x}/pub-dark-padroes.png`,alt:"A aba Mentor com padrões e evidência, em modo escuro",width:780,height:1700,className:"h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"})}),(0,t.jsxs)("div",{className:"absolute bottom-[8vmin] right-[6vmin] flex max-w-[40ch] flex-col items-end gap-[1.2vmin] text-right",children:[(0,t.jsx)("span",{className:"rounded-btn border border-[#c79751]/40 bg-[#1a0d12]/80 px-[1.8vmin] py-[0.9vmin] text-[clamp(0.75rem,1.6vmin,0.95rem)] tracking-[0.08em] text-[#e0b06a]",children:"nove noturnos, um mentor"}),(0,t.jsx)("h2",{className:"m-0 text-[clamp(1.8rem,5vmin,3.8rem)] font-normal leading-[1] text-[#fffaf4]",children:"Fatos primeiro"}),(0,t.jsx)("p",{className:"m-0 text-[clamp(0.9rem,2vmin,1.15rem)] leading-snug text-[#fffaf4]/70",children:"Sugestões vêm com janela, amostra e incerteza — e o julgamento continua humano."})]})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[20] flex items-center justify-center",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.72,.78))),pointerEvents:e.to(e=>e>.76?"auto":"none")},children:[(0,t.jsx)(a.animated.h2,{"aria-hidden":"true",className:"pointer-events-none absolute z-[21] m-0 whitespace-nowrap text-[clamp(1.8rem,7vmin,5.6rem)] font-normal text-[#e9cca6]",style:{opacity:e.to(e=>Math.max(0,(0,p.ato)(e,.72,.86,.3))),transform:e.to(e=>`translateY(${-(12*(0,p.smooth)((0,p.seg)(e,.72,.86)))}vh)`)},children:"E então, o dia."}),(0,t.jsxs)(a.animated.a,{href:"/mentor/","aria-label":"Conhecer o Mentor Bauer",className:"relative block overflow-hidden border border-[#c79751]/30",style:{width:"80vw",aspectRatio:"16/10",borderRadius:e.to(e=>`${(1-(0,p.seg)(e,.72+.08,.98))*2.4}vmin`),transform:e.to(e=>`scale(${.34+.92*(0,p.smooth)((0,p.seg)(e,.74,.985))})`),boxShadow:"0 30px 120px rgba(224,176,106,0.22)"},children:[(0,t.jsx)(o.default,{src:"/apresentacao/previews/mentor.png",alt:"A página do Mentor Bauer",fill:!0,sizes:"80vw",className:"object-cover object-top"}),(0,t.jsx)(a.animated.span,{className:"absolute inset-x-0 bottom-0 flex justify-center pb-[4vmin]",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.9,.97)))},children:(0,t.jsx)("span",{className:"inline-flex min-h-11 items-center justify-center rounded-btn bg-[#6a121a] px-[clamp(1.8rem,4.6vmin,2.8rem)] py-[clamp(1rem,2.2vmin,1.4rem)] text-[clamp(1rem,2.3vmin,1.3rem)] leading-none text-[#f4ede2]",children:"conhecer o Mentor →"})})]})]})]}),g=()=>(0,t.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center gap-[3vmin] bg-[#120a0d] p-[8vmin] text-center text-[#fffaf4]",children:[(0,t.jsx)("h1",{className:"m-0 text-[clamp(2.4rem,8vmin,6rem)] font-normal leading-[0.95] text-[#e9cca6]",children:"Mentor Bauer"}),(0,t.jsx)("p",{className:"m-0 max-w-[54ch] text-[clamp(1rem,2.3vmin,1.3rem)] text-[#fffaf4]/70",children:"Padrões explicáveis, não um placar — rotina, estudo e clínica no mesmo bolso, offline-first."}),(0,t.jsx)(r.default,{href:"/mentor/",className:"inline-flex min-h-11 items-center justify-center rounded-btn bg-[#e9cca6] px-[2.4rem] py-[1.1rem] leading-none text-[#3a0f1d]",children:"conhecer o Mentor →"})]});e.s(["FilmeMentor",0,()=>(0,t.jsx)(f.CineShell,{trackVh:700,fallback:(0,t.jsx)(g,{}),children:e=>(0,t.jsx)(v,{p:e})})],29993)},17931,e=>{"use strict";var t=e.i(43476),a=e.i(48787),o=e.i(57688),r=e.i(22016),i=e.i(71645);let n=`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,s=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // aspect-corrected units, same space as uv
uniform vec2  iMouseVel;       // its spring velocity, per frame, same units

uniform vec3  uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uScale, uSpeed, uStream, uSway, uBody, uCore, uSwirl, uDrift;
uniform float uSpread, uWeave, uFibre, uTravel, uGloss, uSheen;
uniform float uContrast, uMidpoint, uBandAmount, uBandCount, uBandSoft;
uniform float uGlow, uGrain, uDither, uVignette;
uniform float uPointerRadius, uPointerStrength, uPointerDrag, uParallax;

#define BODIES 5
#define TAU 6.2831853

vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }

// softened 1/z — conj(z) / (|z|^2 + r^2). C-infinity, no pole, and r is a real body radius
vec2 csoftinv(vec2 z, float r2) { return vec2(z.x, -z.y) / (dot(z, z) + r2); }

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.42, t));
  c = mix(c, uColorC, smoothstep(0.26, 0.74, t));
  c = mix(c, uColorD, smoothstep(0.60, 1.00, t));
  return c;
}

// triangular-PDF dither — the only reliable cure for 8-bit gradient banding
float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

// ---- house grain. ONE look across the collection: an integer hash (no sin() streaks),
// triangular so it reads as film rather than static, weighted into the midtones so it
// never crusts a black or a white. Static by default; uGrainAnim re-seeds it 24\xd7/s.
uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  float t = iTime * uSpeed;

  vec2 z = (uv - iMouse * uParallax) * uScale;

  // the uniform stream, its heading swinging on two incommensurable rates so it never repeats
  float sa = uSway * (sin(t * 0.41) * 0.6 + sin(t * 0.23 + 1.7) * 0.4);
  vec2 S = uStream * vec2(cos(sa), sin(sa));

  vec2 Ws = cmul(S, z);       // the stream's own potential, kept apart — see the tone block below
  vec2 Wb = vec2(0.0);        // everything the bodies add
  vec2 dW = S;                // the derivative       conj(dW) is the velocity

  float r2 = max(1e-4, uCore * uCore);
  for (int i = 0; i < BODIES; i++) {
    float fi = float(i);
    float ph = fi * 2.3999632;                                   // golden angle — constant, folds at compile time
    vec2  a  = vec2(cos(ph) * 1.42, sin(ph * 1.7) * 0.80)
             + uDrift * vec2(sin(t * (0.61 + 0.09 * fi) + ph), cos(t * (0.47 + 0.07 * fi) + ph * 1.3));
    float an = ph * 2.1 + t * uSwirl * (0.55 + 0.42 * fi);        // the doublet axis turns, so the oval tumbles;
    vec2  mu = uBody * (0.70 + 0.34 * sin(ph * 3.1)) * vec2(cos(an), sin(an));   // rates spread so they never all agree
    vec2  iv = csoftinv(z - a, r2);
    Wb += cmul(mu, iv);
    dW -= cmul(mu, cmul(iv, iv));                                // d/dz (mu/z) = -mu/z^2, softened the same way
  }

  // the cursor, as one more body: strength = uPointerStrength in the stream (0.5 is exactly a
  // cylinder of radius uPointerRadius) plus its own velocity, which is what makes it drag fluid
  float pr2 = max(1e-4, uPointerRadius * uPointerRadius);
  vec2 mv = iMouseVel * (uPointerDrag * 32.0);
  mv *= inversesqrt(1.0 + dot(mv, mv));                          // a flick saturates instead of taking the frame over
  vec2 pmu = pr2 * (S * uPointerStrength * 2.0 + mv);
  vec2 piv = csoftinv(z - iMouse * (1.0 - uParallax) * uScale, pr2);
  Wb += cmul(pmu, piv);
  dW -= cmul(pmu, cmul(piv, piv));

  vec2 W = Ws + Wb;
  float phi = W.x, psi = W.y;

  // fibres: soft stripes in the stream function, i.e. lying along the streamlines.
  // fwidth fades each harmonic out once it is finer than a pixel — an analytic mip, 4 ops
  float ps = psi * uFibre;
  float wf = fwidth(ps); wf *= wf;
  float fib = (sin(ps) / (1.0 + 6.0 * wf) + 0.35 * sin(ps * 2.0 + 0.9) / (1.0 + 24.0 * wf)) * 0.74;

  // equipotentials, walked downstream by time — the motion of the whole frame lives in this line
  float pt = phi * uTravel - iTime * uSpeed * TAU * 1.5;
  float wt = fwidth(pt); wt *= wt;
  float sheen = sin(pt) / (1.0 + 2.0 * wt);

  // speed, relative to the free stream: positive where the flow squeezes, negative in the stagnant pockets
  float sp = length(dW) / max(1e-3, uStream) - 1.0;
  float gloss = sp / (1.0 + abs(sp));

  // Tone. The exposure comes almost entirely from the stream's own ramp, soft-saturated: it is
  // bounded and it is the same every frame. A doublet's far lobe reaches the whole window, so
  // giving the bodies' stream function much weight here lets five of them phase-align and drift
  // the frame to white over a minute — they get 20 % and are separately saturated. Their real
  // tonal presence is uGloss below, which is a difference from the free stream and so has no DC
  // to drift at all, and the fibres, which bend around them without changing the mean.
  float bs = (Ws.y * uSpread) * 1.30;
  float bb = (Wb.y * uSpread);
  float base = 0.5 + 0.5 * (0.80 * bs * inversesqrt(1.0 + bs * bs)
                          + 0.20 * bb * inversesqrt(1.0 + bb * bb));

  float f = base
          + uWeave * fib
          + uGloss * gloss
          + uSheen * sheen * smoothstep(-0.25, 0.55, gloss);
  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);

  // optional posterise into soft bands
  float steps = max(1.0, floor(uBandCount));
  float fs = f * steps;
  float banded = (floor(fs) + smoothstep(0.5 - uBandSoft * 0.5, 0.5 + uBandSoft * 0.5, fract(fs))) / steps;
  f = mix(f, banded, uBandAmount);

  vec3 col = ramp4(f);
  col += (uColorD - uColorC) * uGlow * pow(f, 4.0);               // tint the lit end rather than gaining white
  col = mix(uBg, col, smoothstep(0.0, 0.14, f) * 0.90 + 0.10);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,l={bgColor:"#2445d6",colorA:"#2b5bff",colorB:"#ff6b5a",colorC:"#dce8ff",colorD:"#fffaf6",scale:.55,speed:.33,stream:1.05,sway:.34,body:.6,core:.46,swirl:.38,drift:.5,spread:2.05,weave:.105,fibre:48,travel:11,gloss:.32,sheen:.085,contrast:1.14,midpoint:.5,bandAmount:0,bandCount:6,bandSoft:.42,glow:.26,grain:0,grainAnim:0,dither:1.45,vignette:.055,cursor:1,pointerRadius:.48,pointerStrength:.26,pointerDrag:.28,parallax:.0018,maxDpr:1},c=new Set(["maxDpr","cursor"]),m={bgColor:"uBg"};function d(e){return m[e]??"u"+e[0].toUpperCase()+e.slice(1)}function u({className:e,active:a=!0,config:o}){let r=(0,i.useRef)(null),m=(0,i.useRef)(null),h=(0,i.useMemo)(()=>JSON.stringify(function(e,t){let a={...e};if(!t)return a;for(let o of Object.keys(e)){let e=t[o];typeof e==typeof a[o]&&(a[o]=e)}return a}(l,o)),[o]);return(0,i.useEffect)(()=>{let e=JSON.parse(h),t=r.current;if(!t)return;let a=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!a)return;let o=(e,t)=>{let o=a.createShader(e);return o?(a.shaderSource(o,t),a.compileShader(o),a.getShaderParameter(o,a.COMPILE_STATUS))?o:(console.error(a.getShaderInfoLog(o)),a.deleteShader(o),null):null},i=o(a.VERTEX_SHADER,n),l=o(a.FRAGMENT_SHADER,s),u=a.createProgram();if(!i||!l||!u)return;if(a.attachShader(u,i),a.attachShader(u,l),a.linkProgram(u),!a.getProgramParameter(u,a.LINK_STATUS))return void console.error(a.getProgramInfoLog(u));a.useProgram(u),a.bindVertexArray(a.createVertexArray());let f=new Map,p=e=>(f.has(e)||f.set(e,a.getUniformLocation(u,e)),f.get(e)??null),x=(e,t)=>a.uniform1f(p(e),t),v=(e,t,o)=>a.uniform2f(p(e),t,o);for(let t of Object.keys(e)){if(c.has(t))continue;let o=e[t];if("string"==typeof o){let e=function(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(255&t)/255]}(o);a.uniform3f(p(d(t)),e[0],e[1],e[2])}else x(d(t),o)}let g="number"==typeof e.maxDpr?e.maxDpr:1,b=1,w=()=>{b=Math.min(window.devicePixelRatio||1,g);let e=Math.max(1,Math.round((t.offsetWidth||window.innerWidth)*b)),o=Math.max(1,Math.round((t.offsetHeight||window.innerHeight)*b));(t.width!==e||t.height!==o)&&(t.width=e,t.height=o),a.viewport(0,0,e,o),a.useProgram(u),v("iResolution",e,o)};w();let y=!1,j=new ResizeObserver(()=>{y||(y=!0,requestAnimationFrame(()=>{y=!1,w()}))});j.observe(t);let S={x:0,y:0,vx:0,vy:0,tx:0,ty:0},N=null,A=e=>{let t=window.innerWidth/window.innerHeight;S.tx=(e.clientX/window.innerWidth-.5)*t,S.ty=.5-e.clientY/window.innerHeight};window.addEventListener("pointermove",A,{passive:!0}),window.addEventListener("pointerdown",A,{passive:!0});let C=performance.now(),k=0;return m.current=t=>{let o=t-C;if(C=t,document.hidden)return;let r=o>50?50:o<4.167?4.167:o,i=r>36.7?2.2:.06*r;k+=.001*r,S.vx+=((S.tx-S.x)*.014-.17*S.vx)*i,S.vy+=((S.ty-S.y)*.014-.17*S.vy)*i,S.x+=S.vx*i,S.y+=S.vy*i,a.useProgram(u),x("iTime",k),null===N&&(N={x:S.tx,y:S.ty}),e.cursor||(S.tx=N.x,S.ty=N.y),v("iMouse",S.x,S.y),v("iMouseVel",S.vx,S.vy),a.drawArrays(a.TRIANGLES,0,3)},a.drawArrays(a.TRIANGLES,0,3),()=>{m.current=null,j.disconnect(),window.removeEventListener("pointermove",A),window.removeEventListener("pointerdown",A),a.deleteProgram(u),a.deleteShader(i),a.deleteShader(l),a.getExtension("WEBGL_lose_context")?.loseContext()}},[h]),(0,i.useEffect)(()=>{if(!a)return;let e=0,t=a=>{e=requestAnimationFrame(t),m.current?.(a)};return e=requestAnimationFrame(t),()=>cancelAnimationFrame(e)},[a,h]),(0,t.jsx)("canvas",{ref:r,className:e})}var h=e.i(88880),f=e.i(46693),p=e.i(65016);let x="/assets/grid-images",v="#232733",g=[.12,.32],b=[.3,.48],w=[.46,.64],y=[.62,.76],j=({p:e,faixa:o,cor:r})=>(0,t.jsx)(a.animated.div,{"aria-hidden":"true",className:"absolute inset-0",style:{opacity:e.to(e=>.34*(0,p.ato)(e,o[0],o[1],.25)),background:`radial-gradient(90% 80% at 50% 30%, ${r}, transparent 70%)`}}),S=({p:e,faixa:i,cor:n,nome:s,titulo:l,sub:c,img:m,alt:d,lado:u,checkpoint:h})=>(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[11]",style:{opacity:e.to(e=>(0,p.ato)(e,i[0],i[1],.2))},children:[(0,t.jsx)(a.animated.div,{className:`absolute top-1/2 w-[min(72vmin,86vw)] overflow-hidden rounded-card border border-black/10 shadow-[0_30px_80px_rgba(35,39,51,0.18)] ${"direita"===u?"right-[6vw]":"esquerda"===u?"left-[6vw]":"left-1/2"}`,style:{transform:e.to(e=>{let t=(0,p.smooth)((0,p.seg)(e,i[0],i[0]+.11));return"direita"===u?`translateY(-50%) translateX(${(1-t)*46}%) rotate(${(1-t)*3-1.4}deg)`:"esquerda"===u?`translateY(-50%) translateX(${-((1-t)*46)}%) rotate(${1.4-(1-t)*3}deg)`:`translateX(-50%) translateY(${-50+(1-t)*34}%)`})},children:(0,t.jsx)(o.default,{src:m,alt:d,width:1440,height:900,className:"h-auto w-full"})}),(0,t.jsxs)("div",{className:`absolute bottom-[8vmin] flex max-w-[40ch] flex-col gap-[1.2vmin] ${"esquerda"===u?"right-[6vmin] items-end text-right":"left-[6vmin] items-start text-left"}`,children:[(0,t.jsx)("span",{className:"rounded-btn px-[1.6vmin] py-[0.8vmin] text-[clamp(0.75rem,1.6vmin,0.9rem)] uppercase tracking-[0.14em] text-white",style:{backgroundColor:n},children:s}),(0,t.jsx)("h2",{className:"m-0 text-[clamp(1.9rem,5.4vmin,4rem)] font-normal leading-[1]",style:{color:v},children:l}),(0,t.jsx)("p",{className:"m-0 text-[clamp(0.95rem,2.1vmin,1.2rem)] leading-snug",style:{color:`${v}b3`},children:c}),h&&(0,t.jsx)("div",{style:{pointerEvents:"auto"},children:(0,t.jsx)(r.default,{href:"/medical-hub/",className:"mt-[0.6vmin] inline-flex min-h-11 items-center justify-center rounded-btn px-[clamp(1.4rem,3.6vmin,2.2rem)] py-[clamp(0.8rem,1.8vmin,1.2rem)] text-[clamp(0.95rem,2vmin,1.15rem)] leading-none text-white",style:{backgroundColor:v},children:"ir direto ao Medical HUB →"})})]})]}),N=({p:e})=>(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"absolute inset-0 bg-[#eef0f8]",children:(0,t.jsx)(u,{className:"absolute inset-0 size-full",active:!0})}),(0,t.jsx)(j,{p:e,faixa:g,cor:"#2563EB"}),(0,t.jsx)(j,{p:e,faixa:b,cor:"#7C5CBF"}),(0,t.jsx)(j,{p:e,faixa:w,cor:"#4F46E5"}),(0,t.jsx)(j,{p:e,faixa:y,cor:"#b18b4b"}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[10] flex flex-col items-center justify-center gap-[2.2vmin] text-center",style:{opacity:e.to(e=>e>.13?0:1),pointerEvents:"none"},children:[(0,t.jsx)("h1",{className:"m-0 whitespace-nowrap text-[clamp(2.6rem,10vmin,8rem)] font-normal leading-[0.95]",style:{color:v},children:(0,t.jsx)(h.ScrollLetters,{text:"Medical HUB",p:e,styleFn:(0,p.letrasDoAto)(.005,.13,.5)})}),(0,t.jsx)(a.animated.p,{className:"m-0 max-w-[54ch] text-[clamp(1rem,2.4vmin,1.35rem)] leading-snug",style:{color:`${v}a6`,opacity:e.to(e=>(0,p.ato)(e,.015,.13,.35))},children:"Materiais de residência que citam as próprias fontes — cada especialidade com a sua cor."}),(0,t.jsx)(a.animated.span,{className:"rounded-btn border border-[#b18b4b]/50 bg-white/70 px-[2vmin] py-[1vmin] text-[clamp(0.8rem,1.7vmin,1rem)] tracking-[0.08em] text-[#8a6a2f]",style:{opacity:e.to(e=>(0,p.ato)(e,.03,.13,.4))},children:"the hub never decides"})]}),(0,t.jsx)(S,{p:e,faixa:g,cor:"#2563EB",nome:"clínica · pneumo",lado:"direita",titulo:"Pneumonia como decisão",sub:"Suspeitar, classificar, estratificar, cobrir, reavaliar — cada bloco nasce de uma pergunta clínica real.",img:`${x}/image 553.png`,alt:"Dashboard da plataforma de pneumonias"}),(0,t.jsx)(S,{p:e,faixa:b,cor:"#7C5CBF",nome:"obstetrícia",lado:"esquerda",checkpoint:!0,titulo:"Da pressão ao pós-parto",sub:"Hipertensão, pré-eclâmpsia, diabetes e gemelaridade — por raciocínio clínico, com simuladores de conduta.",img:`${x}/image 554.png`,alt:"Capa de doenças clínicas na gravidez"}),(0,t.jsx)(S,{p:e,faixa:w,cor:"#4F46E5",nome:"infectologia",lado:"baixo",titulo:"Febre com eixo certo",sub:"Dengue, febre ictérica, leishmaniose — o padrão clínico-laboratorial decide o rumo.",img:`${x}/image 567.png`,alt:"Cards de síndromes febris"}),(0,t.jsx)(S,{p:e,faixa:y,cor:"#b18b4b",nome:"a lei da casa",lado:"direita",titulo:"Uma folha",sub:"Cada documento cabe numa folha: feito para imprimir, assinar e usar na UBS de verdade — com fonte citada em cada campo.",img:`${x}/image 563.png`,alt:"Hero da trilha clínica com métricas"}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[20] flex items-center justify-center",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.74,.8))),pointerEvents:e.to(e=>e>.78?"auto":"none")},children:[(0,t.jsx)(a.animated.h2,{"aria-hidden":"true",className:"pointer-events-none absolute z-[21] m-0 whitespace-nowrap text-[clamp(1.8rem,7vmin,5.6rem)] font-normal",style:{color:v,opacity:e.to(e=>Math.max(0,(0,p.ato)(e,.74,.88,.3))),transform:e.to(e=>`translateY(${-(12*(0,p.smooth)((0,p.seg)(e,.74,.88)))}vh)`)},children:"A fonte na mesa."}),(0,t.jsxs)(a.animated.a,{href:"/medical-hub/","aria-label":"Abrir o Medical HUB",className:"relative block overflow-hidden border border-black/10",style:{width:"80vw",aspectRatio:"16/10",borderRadius:e.to(e=>`${(1-(0,p.seg)(e,.82,.98))*2.4}vmin`),transform:e.to(e=>`scale(${.34+.92*(0,p.smooth)((0,p.seg)(e,.76,.985))})`),boxShadow:"0 30px 120px rgba(37,99,235,0.2)"},children:[(0,t.jsx)(o.default,{src:"/apresentacao/previews/medical-hub.png",alt:"A página do Medical HUB",fill:!0,sizes:"80vw",className:"object-cover object-top"}),(0,t.jsx)(a.animated.span,{className:"absolute inset-x-0 bottom-0 flex justify-center pb-[4vmin]",style:{opacity:e.to(e=>(0,p.smooth)((0,p.seg)(e,.9,.97)))},children:(0,t.jsx)("span",{className:"inline-flex min-h-11 items-center justify-center rounded-btn px-[clamp(1.8rem,4.6vmin,2.8rem)] py-[clamp(1rem,2.2vmin,1.4rem)] text-[clamp(1rem,2.3vmin,1.3rem)] leading-none text-white",style:{backgroundColor:v},children:"abrir o Medical HUB →"})})]})]})]}),A=()=>(0,t.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center gap-[3vmin] bg-[#eef0f8] p-[8vmin] text-center",style:{color:v},children:[(0,t.jsx)("h1",{className:"m-0 text-[clamp(2.4rem,8vmin,6rem)] font-normal leading-[0.95]",children:"Medical HUB"}),(0,t.jsx)("p",{className:"m-0 max-w-[54ch] text-[clamp(1rem,2.3vmin,1.3rem)] opacity-70",children:"Materiais de residência que citam as próprias fontes — cada especialidade com a sua cor, cada documento numa folha."}),(0,t.jsx)(r.default,{href:"/medical-hub/",className:"inline-flex min-h-11 items-center justify-center rounded-btn px-[2.4rem] py-[1.1rem] leading-none text-white",style:{backgroundColor:v},children:"abrir o Medical HUB →"})]});e.s(["FilmeHub",0,()=>(0,t.jsx)(f.CineShell,{trackVh:720,tone:"light",fallback:(0,t.jsx)(A,{}),children:e=>(0,t.jsx)(N,{p:e})})],17931)},96051,e=>{"use strict";var t=e.i(43476),a=e.i(48787),o=e.i(65658),r=e.i(57688),i=e.i(22016),n=e.i(71645);let s=`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,l=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // aspect-corrected units, same space as uv

uniform vec3  uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uScale, uSpeed, uFlow, uWarp, uWarpScale, uRoughness;
uniform float uLacunarity, uBias, uBiasAngle, uRim, uRimStep, uRimCurve;
uniform float uAbsorb, uTooth, uToothScale, uContrast, uMidpoint, uSink;
uniform float uGlow, uGrain, uDither, uVignette, uDamp, uPointerRadius;
uniform float uDrift, uParallax;

#define OCTAVES 4

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

// triangular-PDF dither — the only reliable cure for 8-bit gradient banding
float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

vec2 rot(vec2 p, float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c) * p; }


// A WASH ON PAPER. The field is ordinary enough; what makes it ink is the WET EDGE — pigment
// carried to wherever the wash stopped moving and left behind as it dried. That is the
// magnitude of the slope, so it is measured with two extra taps and added back. A wash without
// it is a cloud; with it, the same field reads as something that was liquid a moment ago.
// the warp is by far the expensive half of a wash, and the wet edge needs the field three
// times. So the warp is computed ONCE, outside, and the three taps offset the warped
// coordinate — the slope of the warp itself is not what the edge is made of.
float wash(vec2 base, float t) {
  // the NOISE drifts; the wash axis does not. Reading the lean off a coordinate that carries
  // the drift slides the whole gradient off the frame and the picture goes dark with age.
  vec2 x = base + vec2(t * 0.13, -t * 0.10);
  return 0.5 + dot(base, vec2(cos(uBiasAngle), sin(uBiasAngle))) * uBias + fbm(x) * uAbsorb;
}


// ---- house grain. ONE look across the collection: an integer hash (no sin() streaks),
// triangular so it reads as film rather than static, weighted into the midtones so it
// never crusts a black or a white. Static by default; uGrainAnim re-seeds it 24\xd7/s.
uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  float t = iTime * uSpeed;

  // the hand wets the sheet: where it has been the wash runs further, and it takes its time
  // closing again because the pointer itself is lagged
  vec2 dm = uv - iMouse;
  float wetter = uDamp * exp(-dot(dm, dm) / max(1e-4, uPointerRadius * uPointerRadius));

  vec2 p = (uv - iMouse * uParallax) * uScale + dm * wetter * 0.6 + iMouse * uDrift * 0.25;

  vec2 q = vec2(fbm(p * uWarpScale + vec2(0.0, t * uFlow)),
                fbm(p * uWarpScale + vec2(5.2, 1.3) - t * uFlow * 0.7));
  vec2 base = p + uWarp * q;

  float e = max(0.002, uRimStep);
  float f0 = wash(base, t);
  float fx = wash(base + vec2(e, 0.0), t);
  float fy = wash(base + vec2(0.0, e), t);
  float slope = length(vec2(fx - f0, fy - f0)) / e;

  // pigment PILES UP at the wet edge, so the rim goes DARKER, and it is bounded: a raw
  // slope term is unbounded and turns a wash into wire the moment the field gets steep
  float f = f0 - uRim * smoothstep(0.0, max(0.05, uRimCurve), slope);
  f += uTooth * snoise(p * uToothScale) * 0.5;

  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);


  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBg, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`,c={bgColor:"#eff1f6",colorA:"#bac1db",colorB:"#808ec3",colorC:"#53629f",colorD:"#3b4366",scale:.2,speed:.06,flow:.4,warp:1.54,warpScale:1.17,roughness:.48,lacunarity:2.13,bias:.97,biasAngle:2.97,rim:1.08,rimStep:.06,rimCurve:1.21,absorb:.41,tooth:.018,toothScale:15,contrast:1.45,midpoint:.19,sink:.275,glow:.43,grain:0,grainAnim:0,dither:1.52,vignette:.27,damp:.06,cursor:1,pointerRadius:.92,drift:.02,parallax:.008,maxDpr:1},m={bgColor:"#e9e4ed",colorA:"#cdc3db",colorB:"#aea1ca",colorC:"#8d84b4",colorD:"#6c689d",scale:.2,speed:.06,flow:.39,warp:1.38,warpScale:2.63,roughness:.36,lacunarity:1.92,bias:.84,biasAngle:3.54,rim:.74,rimStep:.061,rimCurve:1.45,absorb:.75,tooth:.098,toothScale:35,contrast:2.48,midpoint:.59,sink:.26,glow:.67,grain:.12,grainAnim:0,dither:1.54,vignette:.27,damp:.06,cursor:1,pointerRadius:.71,drift:.02,parallax:.008,maxDpr:1},d=new Set(["maxDpr","cursor"]),u={bgColor:"uBg"};function h(e){return u[e]??"u"+e[0].toUpperCase()+e.slice(1)}function f({className:e,active:a=!0,config:o}){let r=(0,n.useRef)(null),i=(0,n.useRef)(null),m=(0,n.useMemo)(()=>JSON.stringify(function(e,t){let a={...e};if(!t)return a;for(let o of Object.keys(e)){let e=t[o];typeof e==typeof a[o]&&(a[o]=e)}return a}(c,o)),[o]);return(0,n.useEffect)(()=>{let e=JSON.parse(m),t=r.current;if(!t)return;let a=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!a)return;let o=(e,t)=>{let o=a.createShader(e);return o?(a.shaderSource(o,t),a.compileShader(o),a.getShaderParameter(o,a.COMPILE_STATUS))?o:(console.error(a.getShaderInfoLog(o)),a.deleteShader(o),null):null},n=o(a.VERTEX_SHADER,s),c=o(a.FRAGMENT_SHADER,l),u=a.createProgram();if(!n||!c||!u)return;if(a.attachShader(u,n),a.attachShader(u,c),a.linkProgram(u),!a.getProgramParameter(u,a.LINK_STATUS))return void console.error(a.getProgramInfoLog(u));a.useProgram(u),a.bindVertexArray(a.createVertexArray());let f=new Map,p=e=>(f.has(e)||f.set(e,a.getUniformLocation(u,e)),f.get(e)??null),x=(e,t)=>a.uniform1f(p(e),t),v=(e,t,o)=>a.uniform2f(p(e),t,o);for(let t of Object.keys(e)){if(d.has(t))continue;let o=e[t];if("string"==typeof o){let e=function(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(255&t)/255]}(o);a.uniform3f(p(h(t)),e[0],e[1],e[2])}else x(h(t),o)}let g="number"==typeof e.maxDpr?e.maxDpr:1,b=1,w=()=>{b=Math.min(window.devicePixelRatio||1,g);let e=Math.max(1,Math.round((t.offsetWidth||window.innerWidth)*b)),o=Math.max(1,Math.round((t.offsetHeight||window.innerHeight)*b));(t.width!==e||t.height!==o)&&(t.width=e,t.height=o),a.viewport(0,0,e,o),a.useProgram(u),v("iResolution",e,o)};w();let y=!1,j=new ResizeObserver(()=>{y||(y=!0,requestAnimationFrame(()=>{y=!1,w()}))});j.observe(t);let S={x:0,y:0,ax:0,ay:0,tx:0,ty:0},N=null,A=e=>{let t=window.innerWidth/window.innerHeight;S.tx=(e.clientX/window.innerWidth-.5)*t,S.ty=.5-e.clientY/window.innerHeight};window.addEventListener("pointermove",A,{passive:!0}),window.addEventListener("pointerdown",A,{passive:!0});let C=performance.now(),k=0;return i.current=t=>{let o=t-C;if(C=t,document.hidden)return;let r=o>50?50:o<4.167?4.167:o,i=r>36.7?2.2:.06*r;k+=.001*r;let n=.105*i,s=.043*i;S.ax+=(S.tx-S.ax)*n,S.ay+=(S.ty-S.ay)*n,S.x+=(S.ax-S.x)*s,S.y+=(S.ay-S.y)*s,a.useProgram(u),x("iTime",k),null===N&&(N={x:S.tx,y:S.ty}),e.cursor||(S.tx=N.x,S.ty=N.y),v("iMouse",S.x,S.y),a.drawArrays(a.TRIANGLES,0,3)},a.drawArrays(a.TRIANGLES,0,3),()=>{i.current=null,j.disconnect(),window.removeEventListener("pointermove",A),window.removeEventListener("pointerdown",A),a.deleteProgram(u),a.deleteShader(n),a.deleteShader(c),a.getExtension("WEBGL_lose_context")?.loseContext()}},[m]),(0,n.useEffect)(()=>{if(!a)return;let e=0,t=a=>{e=requestAnimationFrame(t),i.current?.(a)};return e=requestAnimationFrame(t),()=>cancelAnimationFrame(e)},[a,m]),(0,t.jsx)("canvas",{ref:r,className:e})}var p=e.i(88880),x=e.i(46693),v=e.i(65016);let g="#00012f",b="#1b0095",w=()=>{let e=(0,o.useSpring)({from:{rotate:0},to:{rotate:360},loop:!0,config:{duration:14e3}}),i=(0,o.useSpring)({from:{y:0},to:[{y:-8},{y:0}],loop:!0,config:{tension:28,friction:9}});return(0,t.jsx)(a.animated.span,{style:i,className:"block w-fit",children:(0,t.jsx)(a.animated.span,{style:e,className:"block",children:(0,t.jsx)(r.default,{src:"/studies/logo-studies.svg",alt:"",width:120,height:98,className:"h-auto w-[10vmin] min-w-16"})})})},y=({p:e})=>(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"absolute inset-0 bg-[#f0f2fa]",children:(0,t.jsx)(f,{className:"absolute inset-0 size-full",active:!0,config:m})}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[10] flex flex-col items-center justify-center gap-[2.2vmin] text-center",style:{opacity:e.to(e=>e>.16?0:1),pointerEvents:"none"},children:[(0,t.jsx)(w,{}),(0,t.jsx)("h1",{className:"m-0 whitespace-nowrap text-[clamp(2.2rem,8.6vmin,7rem)] font-normal leading-[0.95]",style:{color:g},children:(0,t.jsx)(p.ScrollLetters,{text:"Orquestrator Studies",p:e,styleFn:(0,v.letrasDoAto)(.005,.16,.5)})}),(0,t.jsx)(a.animated.p,{className:"m-0 max-w-[52ch] text-[clamp(1rem,2.4vmin,1.35rem)] leading-snug",style:{color:`${g}99`,opacity:e.to(e=>(0,v.ato)(e,.015,.16,.35))},children:"Quando a noite do cinema termina, o dia de estudo começa."}),(0,t.jsx)(a.animated.span,{className:"rounded-btn border px-[2vmin] py-[1vmin] text-[clamp(0.8rem,1.7vmin,1rem)] tracking-[0.08em]",style:{color:b,borderColor:`${b}38`,backgroundColor:"rgba(255,255,255,0.6)",opacity:e.to(e=>(0,v.ato)(e,.03,.16,.4))},children:"the day after the cinema"})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[11]",style:{opacity:e.to(e=>(0,v.ato)(e,.14,.42,.2))},children:[(0,t.jsx)(a.animated.div,{className:"absolute left-1/2 top-[44%] w-[min(96vmin,88vw)] overflow-hidden rounded-card border border-[#1b0095]/10 shadow-[0_30px_80px_rgba(0,1,47,0.16)]",style:{transform:e.to(e=>{let t=(0,v.smooth)((0,v.seg)(e,.14,.26));return`translate(-50%, ${-50+(1-t)*30}%) rotate(${-((1-t)*2.4)}deg)`})},children:(0,t.jsx)(r.default,{src:"/apresentacao/telas-studies/hero.png",alt:"O catálogo do Orquestrator Studies",width:1440,height:900,priority:!0,className:"h-auto w-full"})}),(0,t.jsxs)("div",{className:"absolute bottom-[7vmin] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[1.2vmin] text-center",children:[(0,t.jsx)("h2",{className:"m-0 text-[clamp(1.8rem,4.8vmin,3.6rem)] font-normal leading-[1]",style:{color:g},children:"Plataformas escolhidas a dedo"}),(0,t.jsx)("div",{style:{pointerEvents:"auto"},children:(0,t.jsx)(i.default,{href:"/studies/",className:"inline-flex min-h-11 items-center justify-center rounded-btn px-[clamp(1.4rem,3.6vmin,2.2rem)] py-[clamp(0.8rem,1.8vmin,1.2rem)] text-[clamp(0.95rem,2vmin,1.15rem)] leading-none text-white",style:{backgroundColor:b},children:"abrir o catálogo agora →"})})]})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[12]",style:{opacity:e.to(e=>(0,v.ato)(e,.4,.68,.2)),pointerEvents:"none"},children:[(0,t.jsx)(a.animated.div,{className:"absolute top-1/2 w-[150vmin] max-w-none overflow-hidden rounded-card border border-[#1b0095]/10 shadow-[0_30px_80px_rgba(0,1,47,0.14)]",style:{transform:e.to(e=>`translateY(-56%) translateX(${10-28*(0,v.seg)(e,.4,.68)}vw)`)},children:(0,t.jsx)(r.default,{src:"/apresentacao/telas-studies/bolhas.png",alt:"As bolhas do catálogo, plataforma a plataforma",width:2160,height:1350,className:"h-auto w-full"})}),(0,t.jsxs)("div",{className:"absolute bottom-[7vmin] left-[6vmin] max-w-[42ch]",children:[(0,t.jsx)("h2",{className:"m-0 text-[clamp(1.8rem,4.8vmin,3.6rem)] font-normal leading-[1]",style:{color:g},children:"Bolha por bolha"}),(0,t.jsx)("p",{className:"m-0 mt-[1vmin] text-[clamp(0.95rem,2.1vmin,1.2rem)] leading-snug",style:{color:`${g}99`},children:"Texto soberano, fontes citadas, simuladores e flashcards — offline-first, no celular, no plantão, na estrada."})]})]}),(0,t.jsxs)(a.animated.section,{className:"absolute inset-0 z-[20] flex items-center justify-center",style:{opacity:e.to(e=>(0,v.smooth)((0,v.seg)(e,.66,.72))),pointerEvents:e.to(e=>e>.66+.04?"auto":"none")},children:[(0,t.jsx)(a.animated.h2,{"aria-hidden":"true",className:"pointer-events-none absolute z-[21] m-0 whitespace-nowrap text-[clamp(1.6rem,6.4vmin,5rem)] font-normal",style:{color:b,opacity:e.to(e=>Math.max(0,(0,v.ato)(e,.66,.66+.16,.3))),transform:e.to(e=>`translateY(${-(12*(0,v.smooth)((0,v.seg)(e,.66,.66+.16)))}vh)`)},children:"Study like an Orquestrator."}),(0,t.jsxs)(a.animated.a,{href:"/studies/","aria-label":"Entrar no Orquestrator Studies",className:"relative block overflow-hidden border border-[#1b0095]/12",style:{width:"80vw",aspectRatio:"16/10",borderRadius:e.to(e=>`${(1-(0,v.seg)(e,.76,.98))*2.4}vmin`),transform:e.to(e=>`scale(${.34+.92*(0,v.smooth)((0,v.seg)(e,.66+.03,.985))})`),boxShadow:"0 30px 120px rgba(27,0,149,0.18)"},children:[(0,t.jsx)(r.default,{src:"/apresentacao/previews/studies.png",alt:"A página do Orquestrator Studies",fill:!0,sizes:"80vw",className:"object-cover object-top"}),(0,t.jsx)(a.animated.span,{className:"absolute inset-x-0 bottom-0 flex justify-center pb-[4vmin]",style:{opacity:e.to(e=>(0,v.smooth)((0,v.seg)(e,.9,.97)))},children:(0,t.jsx)("span",{className:"inline-flex min-h-11 items-center justify-center rounded-btn px-[clamp(1.8rem,4.6vmin,2.8rem)] py-[clamp(1rem,2.2vmin,1.4rem)] text-[clamp(1rem,2.3vmin,1.3rem)] leading-none text-white",style:{backgroundColor:b},children:"entrar no Studies →"})})]})]})]}),j=()=>(0,t.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-center gap-[3vmin] bg-[#f0f2fa] p-[8vmin] text-center",style:{color:g},children:[(0,t.jsx)("h1",{className:"m-0 text-[clamp(2.2rem,7vmin,5.4rem)] font-normal leading-[0.95]",children:"Orquestrator Studies"}),(0,t.jsx)("p",{className:"m-0 max-w-[52ch] text-[clamp(1rem,2.3vmin,1.3rem)] opacity-70",children:"O catálogo de plataformas médicas — escolhidas a dedo, offline-first, com fontes citadas."}),(0,t.jsx)(i.default,{href:"/studies/",className:"inline-flex min-h-11 items-center justify-center rounded-btn px-[2.4rem] py-[1.1rem] leading-none text-white",style:{backgroundColor:b},children:"entrar no Studies →"})]});e.s(["FilmeStudies",0,()=>(0,t.jsx)(x.CineShell,{trackVh:620,tone:"light",fallback:(0,t.jsx)(j,{}),children:e=>(0,t.jsx)(y,{p:e})})],96051)}]);