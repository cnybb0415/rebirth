// 펼침면 사진의 오른쪽 페이지를 오른쪽 아래 모서리부터 원통에 감기듯 말아 넘기는 WebGL 렌더러.
// 종이가 휘는 부분은 원통 단면으로 계산하고, 넘어간 종이의 뒷면에는
// 다음 펼침면의 왼쪽 페이지를 좌우 반전해 붙인다(실제 책에서 오른쪽 장의 뒷면 = 다음 왼쪽 장).

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uT;
uniform float uAspect;
uniform vec4 uPage;
uniform float uR0;
uniform float uTilt;
const float PI = 3.141592653589793;

vec4 tex(sampler2D s, vec2 w) { return texture2D(s, vec2(w.x / uAspect, w.y)); }

// 넘어가는 종이 뒷면: 처음엔 앞면이 살짝 비치는 빈 종이였다가,
// 거의 다 넘어가 왼쪽에 닿을 즈음에만 다음 장의 왼쪽 페이지(실제 뒷면)로 스며듦
vec3 backFace(vec2 o, vec2 m, float t) {
  float ghost = dot(tex(uFrom, o).rgb, vec3(0.299, 0.587, 0.114));
  vec3 plain = vec3(0.90, 0.85, 0.76) * (0.93 + 0.07 * ghost);
  return mix(plain, tex(uTo, m).rgb, smoothstep(0.9, 1.0, t));
}

bool inPage(vec2 w) {
  return w.x >= uPage.x * uAspect && w.x <= uPage.z * uAspect && w.y >= uPage.y && w.y <= uPage.w;
}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec4 A = tex(uFrom, p);
  float t = clamp(uT, 0.0, 1.0);
  if (t <= 0.0001) { gl_FragColor = A; return; }
  vec4 B = tex(uTo, p);

  float spine = uPage.x * uAspect;
  vec2 C = vec2(uPage.z * uAspect, uPage.w);
  float Lend = C.x - spine;

  float phi = uTilt * (1.0 - t);
  vec2 D = vec2(-cos(phi), -sin(phi));
  vec2 P = vec2(-D.y, D.x);
  // 막 들릴 땐 촘촘하게 말리고, 넘어갈수록 커졌다가 다 넘어가면 평평해짐
  float R = max(uR0 * mix(0.35, 1.0, smoothstep(0.0, 0.35, t)) * (1.0 - t), 0.0005);
  float L = t * Lend;

  float x = dot(p - C, D) - L;
  float q = dot(p - C, P);

  // 넘어가 평평하게 덮인 종이 (뒷면)
  if (x >= 0.0) {
    float a = x + PI * R;
    if (a <= L) {
      vec2 o = C + (L - a) * D + q * P;
      if (inPage(o)) {
        vec2 m = vec2(2.0 * spine - o.x, o.y);
        gl_FragColor = vec4(backFace(o, m, t) * 0.95, 1.0);
        return;
      }
    }
  }

  // 원통에 감긴 부분
  if (x < 0.0 && x >= -R) {
    float k = clamp(-x / R, 0.0, 1.0);
    float th1 = PI - asin(k);
    float a1 = R * th1;
    if (a1 <= L) {
      vec2 o = C + (L - a1) * D + q * P;
      if (inPage(o)) {
        vec2 m = vec2(2.0 * spine - o.x, o.y);
        float shade = 0.68 + 0.32 * sin(th1);
        gl_FragColor = vec4(backFace(o, m, t) * shade, 1.0);
        return;
      }
    }
    float th0 = asin(k);
    float a0 = R * th0;
    if (a0 <= L) {
      vec2 o = C + (L - a0) * D + q * P;
      if (inPage(o)) {
        float shade = 1.0 - 0.42 * (th0 / (0.5 * PI));
        gl_FragColor = vec4(tex(uFrom, o).rgb * shade, 1.0);
        return;
      }
    }
  }

  if (inPage(p)) {
    if (x >= 0.0) {
      // 아직 안 들린 종이. 넘어온 종이 끝자락 아래로 그림자
      vec3 c = A.rgb;
      float xe = L - PI * R;
      if (xe > 0.0 && x > xe) c *= 1.0 - 0.3 * exp(-(x - xe) / 0.02);
      gl_FragColor = vec4(c, 1.0);
    } else {
      // 종이가 들려서 드러난 다음 장. 말린 종이 바로 아래가 가장 어두움
      float d = max(-x - R, 0.0);
      gl_FragColor = vec4(B.rgb * (1.0 - 0.45 * exp(-d / 0.035)), 1.0);
    }
    return;
  }

  // 표지·책상·왼쪽 장은 그대로 두다가 마지막에만 다음 장으로 스며듦
  gl_FragColor = mix(A, B, smoothstep(0.9, 1.0, t));
}`;

export type DiaryCurlOptions = {
  canvas: HTMLCanvasElement;
  srcs: string[];
  /** 펼침면 이미지 가로/세로 비율 */
  aspect: number;
  /** 오른쪽 페이지 종이 영역(uv): [책등 x, 위 y, 바깥쪽 x, 아래 y] */
  page: [number, number, number, number];
  /** 말리는 원통 반지름(높이 1 기준) */
  radius?: number;
  /** 모서리에서 시작할 때 접힘선 기울기(rad) */
  tilt?: number;
  /** 모바일에서 앱 전환 등으로 GPU 컨텍스트를 잃었을 때 */
  onLost?: () => void;
};

export type DiaryCurl = {
  /** i번째 장을 평평하게 보여줌 */
  show(i: number): Promise<void>;
  /** from 장을 말아서 to 장을 드러내는 상태로 설정 (t는 유지) */
  setPair(from: number, to: number): void;
  setT(t: number): void;
  getT(): number;
  tweenT(target: number, ms: number): Promise<void>;
  /** 진행도 baseT에서 포인터를 fracX0 → fracX(가로 0~1)로 끌었을 때, 잡은 모서리가 손가락을 그대로 따라오는 진행도 */
  tFromDrag(baseT: number, fracX0: number, fracX: number): number;
  ensure(i: number): Promise<void>;
  resize(): void;
  destroy(): void;
};

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function createDiaryCurl(opts: DiaryCurlOptions): DiaryCurl | null {
  const { canvas, srcs, aspect, page } = opts;
  const radius = opts.radius ?? 0.085;
  const tilt = opts.tilt ?? 0.55;

  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: true });
  if (!gl) return null;

  const onContextLost = (e: Event) => {
    e.preventDefault();
    opts.onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    from: gl.getUniformLocation(prog, "uFrom"),
    to: gl.getUniformLocation(prog, "uTo"),
    t: gl.getUniformLocation(prog, "uT"),
    aspect: gl.getUniformLocation(prog, "uAspect"),
    page: gl.getUniformLocation(prog, "uPage"),
    r0: gl.getUniformLocation(prog, "uR0"),
    tilt: gl.getUniformLocation(prog, "uTilt"),
  };
  gl.uniform1i(u.from, 0);
  gl.uniform1i(u.to, 1);
  gl.uniform1f(u.aspect, aspect);
  gl.uniform4f(u.page, page[0], page[1], page[2], page[3]);
  gl.uniform1f(u.r0, radius);
  gl.uniform1f(u.tilt, tilt);

  const textures: (WebGLTexture | null)[] = srcs.map(() => null);
  const loading: (Promise<void> | null)[] = srcs.map(() => null);

  let from = 0;
  let to = -1;
  let t = 0;
  let raf = 0;
  let tweenId = 0;
  let destroyed = false;

  const draw = () => {
    raf = 0;
    if (destroyed) return;
    const a = textures[from];
    if (!a) return;
    const b = to >= 0 ? textures[to] : null;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, b ?? a);
    gl.uniform1f(u.t, b ? t : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const requestDraw = () => {
    if (!raf && !destroyed) raf = requestAnimationFrame(draw);
  };

  const ensure = (i: number) => {
    if (i < 0 || i >= srcs.length) return Promise.resolve();
    if (textures[i]) return Promise.resolve();
    if (loading[i]) return loading[i]!;
    loading[i] = new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (destroyed) return resolve();
        const tx = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        textures[i] = tx;
        requestDraw();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = srcs[i];
    });
    return loading[i]!;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
    requestDraw();
  };

  const spine = page[0] * aspect;
  const lEnd = page[2] * aspect - spine;

  // 셰이더와 같은 식: 진행도 t일 때 원통 반지름
  const curlRadius = (t: number) => {
    const k = Math.min(Math.max(t / 0.35, 0), 1);
    const smooth = k * k * (3 - 2 * k);
    return Math.max(radius * (0.35 + 0.65 * smooth) * (1 - t), 0.0005);
  };
  // 진행도 t일 때 종이 모서리가 원래 자리에서 책등 쪽으로 가로로 움직인 거리
  const cornerShift = (t: number) => {
    const L = t * lEnd;
    const R = curlRadius(t);
    const along = L <= Math.PI * R ? L - R * Math.sin(L / R) : 2 * L - Math.PI * R;
    return along * Math.cos(tilt * (1 - t));
  };

  return {
    async show(i) {
      tweenId++;
      from = i;
      to = -1;
      t = 0;
      await ensure(i);
      requestDraw();
      void ensure(i + 1);
    },
    setPair(f, nextTo) {
      from = f;
      to = nextTo;
      requestDraw();
    },
    setT(next) {
      tweenId++;
      t = Math.min(Math.max(next, 0), 1);
      requestDraw();
    },
    getT: () => t,
    tweenT(target, ms) {
      const id = ++tweenId;
      const start = t;
      if (ms <= 0 || start === target) {
        t = target;
        requestDraw();
        return Promise.resolve();
      }
      const t0 = performance.now();
      return new Promise<void>((resolve) => {
        const step = (now: number) => {
          if (destroyed || id !== tweenId) return resolve();
          const k = Math.min((now - t0) / ms, 1);
          t = start + (target - start) * easeInOut(k);
          draw();
          if (k < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    },
    tFromDrag(baseT, fracX0, fracX) {
      const target = cornerShift(baseT) + (fracX0 - fracX) * aspect;
      // cornerShift는 t에 대해 증가하므로 이분 탐색으로 역산
      let lo = 0;
      let hi = 1;
      if (target <= 0) return 0;
      if (target >= cornerShift(1)) return 1;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (cornerShift(mid) < target) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    },
    ensure,
    resize,
    destroy() {
      destroyed = true;
      canvas.removeEventListener("webglcontextlost", onContextLost);
      if (raf) cancelAnimationFrame(raf);
      textures.forEach((tx) => tx && gl.deleteTexture(tx));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
