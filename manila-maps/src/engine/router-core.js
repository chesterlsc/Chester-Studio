// Routing core over route.bin (built by data/scripts/build_route.py).
//
// IMPORTANT: routerCore must stay fully self-contained (no imports, no references
// to anything outside the function): router.js serialises it with
// Function.prototype.toString() to start an inline Worker that also works when
// the app is a single HTML file opened from file://.

export function routerCore(scope) {
  'use strict';

  // ------------------------------------------------------------ constants
  var F_CAR_F = 1, F_CAR_B = 2, F_MOTO_F = 4, F_MOTO_B = 8, F_WALK = 16;
  var F_ROUNDABOUT = 32, F_LINK = 64, F_PRIVATE = 256;
  var F_SNAP_CAR = 2048, F_SNAP_MOTO = 4096, F_SNAP_WALK = 8192;
  var F_MINOR_SERVICE = 16384, F_UNPAVED = 32768;

  // km/h by road class and area density (edgeClass bits 6-7, from build_route.py):
  // 0 = dense city (Metro Manila-like traffic), 1 = town, 2 = rural / provincial.
  var CAR_DENSE = {
    motorway: 70, motorway_link: 40, trunk: 28, trunk_link: 22, primary: 25, primary_link: 20,
    secondary: 22, secondary_link: 18, tertiary: 19, tertiary_link: 16, unclassified: 16, residential: 15,
    living_street: 8, service: 10, road: 14, track: 8,
  };
  var CAR_TOWN = {
    motorway: 80, motorway_link: 40, trunk: 38, trunk_link: 28, primary: 33, primary_link: 24,
    secondary: 29, secondary_link: 22, tertiary: 25, tertiary_link: 20, unclassified: 21, residential: 18,
    living_street: 10, service: 12, road: 20, track: 10,
  };
  var CAR_RURAL = {
    motorway: 85, motorway_link: 45, trunk: 52, trunk_link: 35, primary: 47, primary_link: 30,
    secondary: 42, secondary_link: 28, tertiary: 36, tertiary_link: 25, unclassified: 30, residential: 24,
    living_street: 12, service: 15, road: 28, track: 14,
  };
  var MOTO_DENSE = {
    motorway: 60, motorway_link: 35, trunk: 33, trunk_link: 26, primary: 30, primary_link: 24,
    secondary: 27, secondary_link: 22, tertiary: 23, tertiary_link: 20, unclassified: 19, residential: 18,
    living_street: 10, service: 12, road: 16, track: 10,
  };
  function scaled(t, f) { var o = {}; for (var k in t) o[k] = Math.round(t[k] * f); return o; }
  var SPEEDS = {
    car: [CAR_DENSE, CAR_TOWN, CAR_RURAL],
    motorcycle: [MOTO_DENSE, scaled(CAR_TOWN, 1.08), scaled(CAR_RURAL, 1.05)],
    walk: { steps: 2.2, corridor: 4.2, platform: 4.2 },
  };
  var WALK_SPEED = 4.8;
  var NODE_DELAY = { car: 2.5, motorcycle: 1.5, walk: 0 }; // s per busy intersection end

  var td = new TextDecoder();
  var G = null; // graph
  var COST = {}; // mode -> Float32Array edge cost (s, incl. penalties)
  var GRID = null;

  function modeBits(mode) {
    if (mode === 'walk') return { f: F_WALK, b: F_WALK, snap: F_SNAP_WALK };
    if (mode === 'motorcycle') return { f: F_MOTO_F, b: F_MOTO_B, snap: F_SNAP_MOTO };
    return { f: F_CAR_F, b: F_CAR_B, snap: F_SNAP_CAR };
  }

  // ------------------------------------------------------------ loading
  function gunzip(bytes) {
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }

  function load(bytes) {
    var p = (bytes[0] === 0x1f && bytes[1] === 0x8b) ? gunzip(bytes) : Promise.resolve(bytes);
    return p.then(parse);
  }

  function parse(raw) {
    var magic = td.decode(raw.subarray(0, 8));
    if (magic !== 'MMROUTE1') throw new Error('Bad routing graph');
    var hlen = new DataView(raw.buffer, raw.byteOffset, raw.byteLength).getUint32(8, true);
    var header = JSON.parse(td.decode(raw.subarray(12, 12 + hlen)));
    var base = 12 + hlen;
    var buf = raw.buffer, off0 = raw.byteOffset + base;
    if (off0 % 8) { buf = raw.slice(base).buffer; off0 = 0; }
    var TYPED = { uint8: Uint8Array, uint16: Uint16Array, uint32: Uint32Array, int32: Int32Array, float32: Float32Array };
    function sec(name) {
      var s = header.sections[name];
      if (s.type === 'utf8') return td.decode(new Uint8Array(buf, off0 + s.offset, s.length));
      return new TYPED[s.type](buf, off0 + s.offset, s.length);
    }
    var g = {
      N: header.nodes, E: header.edges, classes: header.classes,
      nodeLon: sec('nodeLon'), nodeLat: sec('nodeLat'), adjOff: sec('adjOff'), adj: sec('adj'),
      edgeFrom: sec('edgeFrom'), edgeTo: sec('edgeTo'), edgeLen: sec('edgeLen'), edgeClass: sec('edgeClass'),
      edgeFlags: sec('edgeFlags'), edgeLabel: sec('edgeLabel'), geomOff: sec('geomOff'), geomXY: sec('geomXY'),
      resVia: sec('resVia'), resFrom: sec('resFrom'), resTo: sec('resTo'), resType: sec('resType'),
    };
    g.labels = sec('labels').split('\n').map(function (l) {
      var i = l.indexOf('\t');
      return i < 0 ? { name: l, ref: '' } : { name: l.slice(0, i), ref: l.slice(i + 1) };
    });
    // restrictions by via node (CSR)
    var R = g.resVia.length;
    var rOff = new Uint32Array(g.N + 1);
    for (var i = 0; i < R; i++) rOff[g.resVia[i] + 1]++;
    for (i = 0; i < g.N; i++) rOff[i + 1] += rOff[i];
    var rIdx = new Uint32Array(R);
    var fill = rOff.slice(0, g.N);
    for (i = 0; i < R; i++) rIdx[fill[g.resVia[i]]++] = i;
    g.rOff = rOff; g.rIdx = rIdx;
    // per-node search state
    g.distF = new Float64Array(g.N); g.distB = new Float64Array(g.N);
    g.stampF = new Uint32Array(g.N); g.stampB = new Uint32Array(g.N);
    g.doneF = new Uint32Array(g.N); g.doneB = new Uint32Array(g.N);
    g.predF = new Int32Array(g.N); g.succB = new Int32Array(g.N);
    g.qid = 0;
    G = g; COST = {}; GRID = null;
    return { nodes: g.N, edges: g.E };
  }

  // ------------------------------------------------------------ costs
  function clsOf(e) { return G.classes[G.edgeClass[e] & 63]; }

  function speedOf(mode, e) {
    var cls = clsOf(e);
    if (mode === 'walk') return SPEEDS.walk[cls] || WALK_SPEED;
    var dens = G.edgeClass[e] >> 6;
    return SPEEDS[mode][dens > 2 ? 2 : dens][cls] || 12;
  }

  function costs(mode) {
    if (COST[mode]) return COST[mode];
    var g = G, E = g.E, c = new Float32Array(E);
    var delay = NODE_DELAY[mode] || 0;
    for (var e = 0; e < E; e++) {
      var cls = clsOf(e);
      var fl = g.edgeFlags[e];
      var t = g.edgeLen[e] / (speedOf(mode, e) / 3.6);
      if (mode !== 'walk') {
        if (fl & F_PRIVATE) t = t * 4 + 30;
        if (fl & F_MINOR_SERVICE) t *= 1.6;
        if (fl & F_UNPAVED) t *= 1.4;
        if (delay) {
          if (g.adjOff[g.edgeFrom[e] + 1] - g.adjOff[g.edgeFrom[e]] >= 3) t += delay;
          if (g.adjOff[g.edgeTo[e] + 1] - g.adjOff[g.edgeTo[e]] >= 3) t += delay;
        }
      } else {
        if (fl & F_PRIVATE) t = t * 2 + 20;
        // prefer quieter streets / footpaths a little over big roads
        if (cls === 'trunk' || cls === 'primary') t *= 1.15;
      }
      c[e] = t;
    }
    COST[mode] = c;
    return c;
  }

  /** Real (penalty-free) travel time of length m on edge e. */
  function travelTime(mode, e, m) {
    return m / (speedOf(mode, e) / 3.6);
  }

  // ------------------------------------------------------------ geometry helpers
  function edgeCoords(e) {
    var g = G, out = [];
    out.push([g.nodeLon[g.edgeFrom[e]] / 1e6, g.nodeLat[g.edgeFrom[e]] / 1e6]);
    for (var k = g.geomOff[e]; k < g.geomOff[e + 1]; k++) out.push([g.geomXY[2 * k] / 1e6, g.geomXY[2 * k + 1] / 1e6]);
    out.push([g.nodeLon[g.edgeTo[e]] / 1e6, g.nodeLat[g.edgeTo[e]] / 1e6]);
    return out;
  }

  function dist(a, b) {
    var cl = Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180);
    var dx = (b[0] - a[0]) * 111319.5 * cl, dy = (b[1] - a[1]) * 110946;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function bearing(a, b) {
    var cl = Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180);
    var dx = (b[0] - a[0]) * cl, dy = b[1] - a[1];
    var deg = Math.atan2(dx, dy) * 180 / Math.PI;
    return (deg + 360) % 360;
  }

  function polyLen(co) {
    var s = 0;
    for (var i = 1; i < co.length; i++) s += dist(co[i - 1], co[i]);
    return s;
  }

  /** Cut polyline co between distances d0..d1 (metres from its start). */
  function slice(co, d0, d1) {
    var out = [], acc = 0;
    for (var i = 1; i < co.length; i++) {
      var a = co[i - 1], b = co[i], l = dist(a, b);
      var s0 = acc, s1 = acc + l;
      if (s1 >= d0 && s0 <= d1 && l > 0) {
        var t0 = Math.max(0, (d0 - s0) / l), t1 = Math.min(1, (d1 - s0) / l);
        var p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0];
        var p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
        if (!out.length) out.push(p0);
        out.push(p1);
      }
      acc = s1;
    }
    if (!out.length) out.push(co[0]);
    return out;
  }

  // ------------------------------------------------------------ snapping (spatial grid)
  var CELL = 1500; // 0.0015 deg (~165 m)

  function buildGrid() {
    // cell -> edges (each edge listed once per cell it crosses)
    var g = G, E = g.E;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < g.N; i++) {
      var x = g.nodeLon[i], y = g.nodeLat[i];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    var nx = Math.ceil((maxX - minX) / CELL) + 1, ny = Math.ceil((maxY - minY) / CELL) + 1;
    var counts = new Uint32Array(nx * ny + 1);
    var tmp = [];
    function edgeCells(e) {
      tmp.length = 0;
      var n = g.geomOff[e + 1] - g.geomOff[e] + 2;
      var a = segPt(e, 0, n);
      for (var k = 1; k < n; k++) {
        var b = segPt(e, k, n);
        var cx0 = Math.floor((Math.min(a[0], b[0]) - minX) / CELL), cx1 = Math.floor((Math.max(a[0], b[0]) - minX) / CELL);
        var cy0 = Math.floor((Math.min(a[1], b[1]) - minY) / CELL), cy1 = Math.floor((Math.max(a[1], b[1]) - minY) / CELL);
        for (var cy = cy0; cy <= cy1; cy++) {
          for (var cx = cx0; cx <= cx1; cx++) {
            var c = cy * nx + cx;
            if (tmp.indexOf(c) < 0) tmp.push(c);
          }
        }
        a = b;
      }
      return tmp;
    }
    var e, j, cs;
    for (e = 0; e < E; e++) { cs = edgeCells(e); for (j = 0; j < cs.length; j++) counts[cs[j] + 1]++; }
    for (i = 1; i < counts.length; i++) counts[i] += counts[i - 1];
    var edges = new Uint32Array(counts[counts.length - 1]);
    var fill = counts.slice(0, nx * ny);
    for (e = 0; e < E; e++) { cs = edgeCells(e); for (j = 0; j < cs.length; j++) edges[fill[cs[j]]++] = e; }
    GRID = { minX: minX, minY: minY, nx: nx, ny: ny, counts: counts, edges: edges, seen: new Uint32Array(E), q: 0 };
  }

  /** Nearest edge usable by mode. Returns { edge, along (m from edgeFrom), len, point, distance }. */
  function snapPoint(lon, lat, mode, maxM) {
    if (!GRID) buildGrid();
    var g = G, gr = GRID, bits = modeBits(mode);
    var q = ++gr.q;
    maxM = maxM || 1500;
    var X = lon * 1e6, Y = lat * 1e6;
    var mx = 0.1113195 * Math.cos(lat * Math.PI / 180), my = 0.110946;
    var cx = Math.floor((X - gr.minX) / CELL), cy = Math.floor((Y - gr.minY) / CELL);
    var best = Infinity, bestE = -1, bestK = 0, bestT = 0;
    var maxRing = Math.ceil(maxM / 160) + 1;
    for (var ring = 0; ring <= maxRing; ring++) {
      for (var y = cy - ring; y <= cy + ring; y++) {
        if (y < 0 || y >= gr.ny) continue;
        for (var x = cx - ring; x <= cx + ring; x++) {
          if (x < 0 || x >= gr.nx) continue;
          if (Math.abs(x - cx) !== ring && Math.abs(y - cy) !== ring) continue;
          var c = y * gr.nx + x;
          for (var i = gr.counts[c]; i < gr.counts[c + 1]; i++) {
            var e = gr.edges[i];
            if (gr.seen[e] === q) continue;
            gr.seen[e] = q;
            if (!(g.edgeFlags[e] & bits.snap)) continue;
            var n = g.geomOff[e + 1] - g.geomOff[e] + 2;
            var a = segPt(e, 0, n);
            for (var k = 0; k < n - 1; k++) {
              var b = segPt(e, k + 1, n);
              var ax = (a[0] - X) * mx, ay = (a[1] - Y) * my, bx = (b[0] - X) * mx, by = (b[1] - Y) * my;
              var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
              var t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0;
              t = t < 0 ? 0 : t > 1 ? 1 : t;
              var px = ax + t * dx, py = ay + t * dy, d = px * px + py * py;
              if (d < best) { best = d; bestE = e; bestK = k; bestT = t; }
              a = b;
            }
          }
        }
      }
      // ring r covers at least (r * 165 m) around; stop once best is within it
      if (bestE >= 0 && Math.sqrt(best) < ring * 160) break;
    }
    if (bestE < 0) return null;
    var dm = Math.sqrt(best);
    if (dm > maxM) return null;
    var e2 = bestE, k2 = bestK;
    var co = edgeCoords(e2);
    var along = 0;
    for (var j = 0; j < k2; j++) along += dist(co[j], co[j + 1]);
    var segL = dist(co[k2], co[k2 + 1]);
    along += segL * bestT;
    var total = polyLen(co);
    var p = [co[k2][0] + (co[k2 + 1][0] - co[k2][0]) * bestT, co[k2][1] + (co[k2 + 1][1] - co[k2][1]) * bestT];
    return { edge: e2, along: Math.min(along, total), len: total, point: p, distance: dm };
  }

  function segPt(e, k, n) {
    var g = G;
    if (k === 0) return [g.nodeLon[g.edgeFrom[e]], g.nodeLat[g.edgeFrom[e]]];
    if (k === n - 1) return [g.nodeLon[g.edgeTo[e]], g.nodeLat[g.edgeTo[e]]];
    var q = g.geomOff[e] + k - 1;
    return [g.geomXY[2 * q], g.geomXY[2 * q + 1]];
  }

  // ------------------------------------------------------------ heap
  function Heap(cap) {
    this.k = new Float64Array(cap); this.v = new Int32Array(cap); this.n = 0;
  }
  Heap.prototype.push = function (key, val) {
    if (this.n === this.k.length) {
      var k2 = new Float64Array(this.n * 2), v2 = new Int32Array(this.n * 2);
      k2.set(this.k); v2.set(this.v); this.k = k2; this.v = v2;
    }
    var i = this.n++, K = this.k, V = this.v;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (K[p] <= key) break;
      K[i] = K[p]; V[i] = V[p]; i = p;
    }
    K[i] = key; V[i] = val;
  };
  Heap.prototype.pop = function () { // returns val; key in this.lastKey
    var K = this.k, V = this.v, top = V[0];
    this.lastKey = K[0];
    var n = --this.n;
    if (n > 0) {
      var key = K[n], val = V[n], i = 0;
      for (;;) {
        var l = 2 * i + 1;
        if (l >= n) break;
        var r = l + 1, m = (r < n && K[r] < K[l]) ? r : l;
        if (K[m] >= key) break;
        K[i] = K[m]; V[i] = V[m]; i = m;
      }
      K[i] = key; V[i] = val;
    }
    return top;
  };
  Heap.prototype.peek = function () { return this.n ? this.k[0] : Infinity; };
  var HF = null, HB = null;

  // ------------------------------------------------------------ restrictions
  /** Is the turn inEdge -> outEdge at node v forbidden? */
  function banned(v, inEdge, outEdge, motor) {
    if (inEdge === outEdge && inEdge >= 0) return true; // no U-turn on the same edge
    if (!motor || inEdge < 0 || outEdge < 0) return false;
    var g = G;
    var onlyHit = false, onlyMatch = false;
    for (var i = g.rOff[v]; i < g.rOff[v + 1]; i++) {
      var r = g.rIdx[i];
      if (g.resFrom[r] !== inEdge) continue;
      if (g.resType[r] === 0) { if (g.resTo[r] === outEdge) return true; }
      else { onlyHit = true; if (g.resTo[r] === outEdge) onlyMatch = true; }
    }
    return onlyHit && !onlyMatch;
  }

  // ------------------------------------------------------------ bidirectional Dijkstra
  function search(src, dst, mode) {
    var g = G, cost = costs(mode), bits = modeBits(mode), motor = mode !== 'walk';
    var qid = ++g.qid;
    if (!HF) { HF = new Heap(1 << 16); HB = new Heap(1 << 16); }
    HF.n = 0; HB.n = 0;
    var distF = g.distF, distB = g.distB, stampF = g.stampF, stampB = g.stampB;
    var doneF = g.doneF, doneB = g.doneB, predF = g.predF, succB = g.succB;
    var best = Infinity, meet = -1, direct = null;
    var es = src.edge, et = dst.edge;
    var cs = cost[es], ct = cost[et];
    var fs = src.len > 0 ? src.along / src.len : 0, ft = dst.len > 0 ? dst.along / dst.len : 0;
    var flS = g.edgeFlags[es], flT = g.edgeFlags[et];

    function initF(node, c) {
      if (stampF[node] !== qid || c < distF[node]) {
        stampF[node] = qid; distF[node] = c; predF[node] = es; HF.push(c, node);
      }
    }
    function initB(node, c) {
      if (stampB[node] !== qid || c < distB[node]) {
        stampB[node] = qid; distB[node] = c; succB[node] = et; HB.push(c, node);
      }
    }
    if (flS & bits.f) initF(g.edgeTo[es], (1 - fs) * cs);
    if (flS & bits.b) initF(g.edgeFrom[es], fs * cs);
    if (flT & bits.f) initB(g.edgeFrom[et], ft * ct);
    if (flT & bits.b) initB(g.edgeTo[et], (1 - ft) * ct);
    if (es === et) {
      if ((flS & bits.f) && ft >= fs) { best = (ft - fs) * cs; direct = 'f'; }
      if ((flS & bits.b) && ft <= fs && (fs - ft) * cs < best) { best = (fs - ft) * cs; direct = 'b'; }
    }
    // initial meetings
    function tryMeet(v) {
      if (stampF[v] === qid && stampB[v] === qid) {
        var c = distF[v] + distB[v];
        if (c < best && !banned(v, predF[v], succB[v], motor)) { best = c; meet = v; direct = null; }
      }
    }
    for (var i = 0; i < HF.n; i++) tryMeet(HF.v[i]);

    var adjOff = g.adjOff, adj = g.adj, eFrom = g.edgeFrom, eTo = g.edgeTo, eFl = g.edgeFlags;
    var settled = 0;
    while (HF.n || HB.n) {
      var topF = HF.peek(), topB = HB.peek();
      if (topF + topB >= best) break;
      if (topF <= topB) {
        var u = HF.pop(), du = HF.lastKey;
        if (doneF[u] === qid || du > distF[u]) continue;
        doneF[u] = qid; settled++;
        var pin = predF[u];
        for (var a = adjOff[u], aEnd = adjOff[u + 1]; a < aEnd; a++) {
          var e = adj[a], fl = eFl[e], w;
          if (eFrom[e] === u && (fl & bits.f)) w = eTo[e];
          else if (eTo[e] === u && (fl & bits.b)) w = eFrom[e];
          else continue;
          if (banned(u, pin, e, motor)) continue;
          var nd = du + cost[e];
          if (stampF[w] !== qid || nd < distF[w]) {
            if (stampF[w] === qid && doneF[w] === qid) continue;
            stampF[w] = qid; distF[w] = nd; predF[w] = e; HF.push(nd, w);
            if (stampB[w] === qid) {
              var c2 = nd + distB[w];
              if (c2 < best && !banned(w, e, succB[w], motor)) { best = c2; meet = w; direct = null; }
            }
          }
        }
      } else {
        var v = HB.pop(), dv = HB.lastKey;
        if (doneB[v] === qid || dv > distB[v]) continue;
        doneB[v] = qid; settled++;
        var sout = succB[v];
        for (var b = adjOff[v], bEnd = adjOff[v + 1]; b < bEnd; b++) {
          var e2 = adj[b], fl2 = eFl[e2], x;
          // edge must lead INTO v
          if (eTo[e2] === v && (fl2 & bits.f)) x = eFrom[e2];
          else if (eFrom[e2] === v && (fl2 & bits.b)) x = eTo[e2];
          else continue;
          if (banned(v, e2, sout, motor)) continue;
          var nd2 = dv + cost[e2];
          if (stampB[x] !== qid || nd2 < distB[x]) {
            if (stampB[x] === qid && doneB[x] === qid) continue;
            stampB[x] = qid; distB[x] = nd2; succB[x] = e2; HB.push(nd2, x);
            if (stampF[x] === qid) {
              var c3 = distF[x] + nd2;
              if (c3 < best && !banned(x, predF[x], e2, motor)) { best = c3; meet = x; direct = null; }
            }
          }
        }
      }
    }
    if (best === Infinity) return null;
    if (direct) return { direct: direct, settled: settled };
    // reconstruct: edges with traversal direction
    var fwd = [];
    var n = meet;
    var guard = 0;
    while (true) {
      var pe = predF[n];
      if (pe === es) break; // reached a node labelled directly from the start edge
      fwd.push(pe);
      n = (eTo[pe] === n) ? eFrom[pe] : eTo[pe];
      if (++guard > 1e6) return null;
    }
    var startNode = n;
    fwd.reverse();
    var bwd = [];
    n = meet;
    guard = 0;
    while (true) {
      var se = succB[n];
      if (se === et) break;
      bwd.push(se);
      n = (eFrom[se] === n) ? eTo[se] : eFrom[se];
      if (++guard > 1e6) return null;
    }
    var endNode = n;
    return { startNode: startNode, endNode: endNode, edges: fwd.concat(bwd), settled: settled };
  }

  // ------------------------------------------------------------ route assembly
  function route(params) {
    if (!G) throw new Error('Router not loaded');
    var mode = params.mode === 'walk' || params.mode === 'motorcycle' ? params.mode : 'car';
    var t0 = Date.now();
    var src = snapPoint(params.from[0], params.from[1], mode);
    var dst = snapPoint(params.to[0], params.to[1], mode);
    if (!src || !dst) return null;
    var res = search(src, dst, mode);
    if (!res) return null;
    var g = G;
    // pieces: { edge, coords (in travel direction), len }
    var pieces = [];
    if (res.direct) {
      var co = edgeCoords(src.edge);
      var a = src.along, b = dst.along;
      var part = res.direct === 'f' ? slice(co, a, b) : slice(co, b, a).reverse();
      pieces.push({ edge: src.edge, coords: part, len: Math.abs(b - a) });
    } else {
      // first partial edge: from snap point to startNode
      var cs = edgeCoords(src.edge);
      if (res.startNode === g.edgeTo[src.edge]) pieces.push({ edge: src.edge, coords: slice(cs, src.along, src.len), len: src.len - src.along });
      else pieces.push({ edge: src.edge, coords: slice(cs, 0, src.along).reverse(), len: src.along });
      var node = res.startNode;
      for (var i = 0; i < res.edges.length; i++) {
        var e = res.edges[i];
        var c = edgeCoords(e);
        if (g.edgeFrom[e] !== node) c.reverse();
        pieces.push({ edge: e, coords: c, len: g.edgeLen[e] });
        node = g.edgeFrom[e] === node ? g.edgeTo[e] : g.edgeFrom[e];
      }
      var ce = edgeCoords(dst.edge);
      if (res.endNode === g.edgeFrom[dst.edge]) pieces.push({ edge: dst.edge, coords: slice(ce, 0, dst.along), len: dst.along });
      else pieces.push({ edge: dst.edge, coords: slice(ce, dst.along, dst.len).reverse(), len: dst.len - dst.along });
    }
    // geometry + per-piece index ranges
    var geometry = [];
    for (i = 0; i < pieces.length; i++) {
      var pc = pieces[i].coords;
      var startIdx = geometry.length ? geometry.length - 1 : 0;
      for (var k = 0; k < pc.length; k++) {
        if (geometry.length && k === 0) {
          var last = geometry[geometry.length - 1];
          if (Math.abs(last[0] - pc[0][0]) < 1e-9 && Math.abs(last[1] - pc[0][1]) < 1e-9) continue;
        }
        geometry.push([round6(pc[k][0]), round6(pc[k][1])]);
      }
      pieces[i].g0 = startIdx;
      pieces[i].g1 = geometry.length - 1;
      pieces[i].dur = travelTime(mode, pieces[i].edge, pieces[i].len);
    }
    // intersection delays (realistic waiting at busy junctions)
    var delay = NODE_DELAY[mode] || 0;
    if (delay) {
      for (i = 1; i < pieces.length; i++) {
        var nodeAt = sharedNode(pieces[i - 1].edge, pieces[i].edge);
        if (nodeAt >= 0 && g.adjOff[nodeAt + 1] - g.adjOff[nodeAt] >= 3) pieces[i].dur += 2 * delay;
      }
    }
    var distance = 0, duration = 0;
    for (i = 0; i < pieces.length; i++) { distance += pieces[i].len; duration += pieces[i].dur; }
    var steps = buildSteps(pieces, geometry, mode);
    var debug = params.debug ? pieces.map(function (pc, i) {
      // direction of travel over the edge: true = edgeFrom -> edgeTo
      var e = pc.edge, a = pc.coords[0], b = pc.coords[pc.coords.length - 1];
      var fx = G.nodeLon[G.edgeFrom[e]] / 1e6, fy = G.nodeLat[G.edgeFrom[e]] / 1e6;
      var fwd = res.direct ? res.direct === 'f'
        : i === 0 ? res.startNode === G.edgeTo[e]
          : i === pieces.length - 1 ? res.endNode === G.edgeFrom[e]
            : dist(a, [fx, fy]) < dist(b, [fx, fy]);
      return { edge: e, forward: fwd, flags: G.edgeFlags[e], cls: clsOf(e), name: label(e).name, len: pc.len };
    }) : undefined;
    return {
      mode: mode,
      distance: Math.round(distance),
      duration: Math.round(duration),
      geometry: geometry,
      steps: steps,
      snapped: { from: [round6(src.point[0]), round6(src.point[1])], to: [round6(dst.point[0]), round6(dst.point[1])] },
      stats: { ms: Date.now() - t0, settled: res.settled },
      debug: debug,
    };
  }

  function round6(v) { return Math.round(v * 1e6) / 1e6; }

  function sharedNode(e1, e2) {
    var g = G;
    if (g.edgeTo[e1] === g.edgeFrom[e2] || g.edgeTo[e1] === g.edgeTo[e2]) return g.edgeTo[e1];
    if (g.edgeFrom[e1] === g.edgeFrom[e2] || g.edgeFrom[e1] === g.edgeTo[e2]) return g.edgeFrom[e1];
    return -1;
  }

  // ------------------------------------------------------------ steps / instructions
  var CARD = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  function cardinal(b) { return CARD[Math.round(b / 45) % 8]; }
  function norm(a) { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; }
  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /** Bearing of the path arriving at geometry[i] (looking back ~20 m) and leaving it (~20 m ahead). */
  function bearingIn(geom, i) {
    var acc = 0, j = i;
    while (j > 0 && acc < 20) { acc += dist(geom[j - 1], geom[j]); j--; }
    return j === i ? null : bearing(geom[j], geom[i]);
  }
  function bearingOut(geom, i) {
    var acc = 0, j = i;
    while (j < geom.length - 1 && acc < 20) { acc += dist(geom[j], geom[j + 1]); j++; }
    return j === i ? null : bearing(geom[i], geom[j]);
  }

  /** Outgoing options at node v (other than arriving edge inE and taken edge outE): bearings. */
  function otherOptions(v, inE, outE, mode) {
    var g = G, bits = modeBits(mode), res = [];
    for (var a = g.adjOff[v]; a < g.adjOff[v + 1]; a++) {
      var e = g.adj[a];
      if (e === inE || e === outE) continue;
      var co = edgeCoords(e), ok;
      if (g.edgeFrom[e] === v) ok = g.edgeFlags[e] & bits.f;
      else { ok = g.edgeFlags[e] & bits.b; co.reverse(); }
      if (!ok) continue;
      res.push({ edge: e, bearing: bearingOut(co, 0), link: !!(g.edgeFlags[e] & F_LINK), cls: clsOf(e) });
    }
    return res;
  }

  function modifierFor(angle) {
    var a = Math.abs(angle), side = angle < 0 ? 'left' : 'right';
    if (a < 15) return 'straight';
    if (a < 45) return 'slight ' + side;
    if (a < 130) return side;
    if (a < 170) return 'sharp ' + side;
    return 'uturn';
  }

  var MAJOR = { motorway: 1, trunk: 1, primary: 1, motorway_link: 1, trunk_link: 1, primary_link: 1 };

  function label(e) { return G.labels[G.edgeLabel[e]] || { name: '', ref: '' }; }

  function buildSteps(pieces, geom, mode) {
    var g = G, steps = [];
    function newStep(maneuver, modifier, piece, idx) {
      var lb = label(piece.edge);
      return { maneuver: maneuver, modifier: modifier, name: lb.name, ref: lb.ref, distance: 0, duration: 0,
        location: geom[idx], geometryIndex: idx, _edge: piece.edge };
    }
    function angleAt(i0, i1) {
      var bi = bearingIn(geom, i0), bo = bearingOut(geom, i1);
      return (bi == null || bo == null) ? 0 : norm(bo - bi);
    }
    var first = pieces[0];
    var cur = newStep('depart', null, first, 0);
    var b0 = bearingOut(geom, 0);
    cur._bearing = b0 == null ? 0 : b0;
    var inRound = null; // { exits, step }
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      if (i > 0) {
        var prev = pieces[i - 1];
        var v = sharedNode(prev.edge, p.edge);
        var idx = p.g0;
        var lbP = label(prev.edge), lbC = label(p.edge);
        var flP = g.edgeFlags[prev.edge], flC = g.edgeFlags[p.edge];
        var rbP = !!(flP & F_ROUNDABOUT), rbC = !!(flC & F_ROUNDABOUT);
        var bin = bearingIn(geom, idx), bout = bearingOut(geom, idx);
        var angle = (bin == null || bout == null) ? 0 : norm(bout - bin);
        var opts = v >= 0 ? otherOptions(v, prev.edge, p.edge, mode) : [];
        var m = null, mod = null;
        if (rbC && !rbP) {
          // entering a roundabout
          steps.push(cur);
          cur = newStep('roundabout', null, p, idx);
          inRound = { exits: 0 };
          cur._round = inRound;
        } else if (rbC && rbP) {
          // The route can start (or snap) already on the roundabout: track exits from here.
          if (!inRound) inRound = { exits: 0 };
          if (opts.some(function (o) { return !(g.edgeFlags[o.edge] & F_ROUNDABOUT); })) inRound.exits++;
        } else if (!rbC && rbP && inRound) {
          inRound.exits++;
          cur.name = lbC.name; cur.ref = lbC.ref; cur._edge = p.edge;
          inRound = null;
        } else {
          var sameName = (lbP.name && lbP.name === lbC.name) || (!lbP.name && !lbC.name && lbP.ref === lbC.ref);
          var linkP = !!(flP & F_LINK), linkC = !!(flC & F_LINK);
          var clsC = clsOf(p.edge);
          var straightAlt = opts.some(function (o) { return o.bearing != null && bin != null && Math.abs(norm(o.bearing - bin)) < 35; });
          var forwardAlts = opts.filter(function (o) { return o.bearing != null && bin != null && Math.abs(norm(o.bearing - bin)) < 50; });
          if (Math.abs(angle) >= 170 && opts.length === 0 && mode !== 'walk') {
            m = 'uturn'; mod = 'uturn';
          } else if (linkC && !linkP && opts.length) {
            m = 'ramp'; mod = angle < 0 ? 'slight left' : 'slight right';
            if (Math.abs(angle) >= 45) mod = modifierFor(angle);
          } else if (linkP && !linkC && MAJOR[clsC] && Math.abs(angle) < 50) {
            m = 'merge'; mod = angle < 0 ? 'slight left' : angle > 0 ? 'slight right' : 'straight';
          } else if (forwardAlts.length === 1 && Math.abs(angle) < 50 && (linkC || MAJOR[clsC] || forwardAlts[0].link) && opts.length <= 2) {
            m = 'fork';
            mod = norm(bout - forwardAlts[0].bearing) < 0 ? 'slight left' : 'slight right';
            if (sameName && !linkC) m = null; // the road we are on just continues
          } else if (!sameName) {
            if (!opts.length && Math.abs(angle) < 45) {
              // road just changes name (or we leave a named road onto an unnamed bit)
              m = lbC.name || lbC.ref ? 'continue' : null;
              mod = 'straight';
            } else {
              mod = modifierFor(angle);
              m = mod === 'straight' ? 'continue' : mod === 'uturn' ? 'uturn' : (mod.indexOf('slight') === 0 && !straightAlt ? 'continue' : 'turn');
            }
          } else if (Math.abs(angle) >= 40 && opts.length && (straightAlt || Math.abs(angle) >= 70)) {
            mod = modifierFor(angle);
            m = mod === 'uturn' ? 'uturn' : 'turn';
          }
          // ignore tiny unnamed connectors between two stretches of the same road
          if (m && !lbC.name && !lbC.ref && p.len < 25 && i + 1 < pieces.length) {
            var lbN = label(pieces[i + 1].edge);
            if (lbN.name && lbN.name === lbP.name) m = null;
          }
          if (m) {
            steps.push(cur);
            cur = newStep(m, mod, p, idx);
          }
        }
      }
      cur.distance += p.len;
      cur.duration += p.dur;
    }
    steps.push(cur);
    // arrive
    var endIdx = geom.length - 1;
    var arrive = { maneuver: 'arrive', modifier: null, name: cur.name, ref: cur.ref, distance: 0, duration: 0,
      location: geom[endIdx], geometryIndex: endIdx };
    steps.push(arrive);
    // walking: no ramps/merges/forks, just turns
    if (mode === 'walk') {
      for (i = 1; i < steps.length - 1; i++) {
        var w = steps[i];
        if (w.maneuver === 'ramp' || w.maneuver === 'merge' || w.maneuver === 'fork') {
          var wm = angleAt(w.geometryIndex, w.geometryIndex);
          w.modifier = modifierFor(wm);
          w.maneuver = w.modifier === 'straight' ? 'continue' : w.modifier === 'uturn' ? 'uturn' : 'turn';
        }
      }
    }
    // a very short step followed by another maneuver = one maneuver (e.g. two quick
    // lefts around a median = U-turn; a tiny connector before the real turn)
    var comb = [];
    for (i = 0; i < steps.length; i++) {
      var c0 = steps[i];
      comb.push(c0);
      while (c0.maneuver !== 'depart' && c0.maneuver !== 'roundabout' && c0.maneuver !== 'arrive' &&
             c0.distance < 20 && i + 1 < steps.length &&
             steps[i + 1].maneuver !== 'arrive' && steps[i + 1].maneuver !== 'roundabout') {
        var nx = steps[++i];
        var ang = angleAt(c0.geometryIndex, nx.geometryIndex);
        c0.distance += nx.distance; c0.duration += nx.duration;
        c0.name = nx.name; c0.ref = nx.ref;
        var md2 = modifierFor(ang);
        if (md2 === 'uturn') { c0.maneuver = 'uturn'; c0.modifier = 'uturn'; }
        else if (md2 === 'straight') { c0.maneuver = 'continue'; c0.modifier = 'straight'; }
        else {
          if (c0.maneuver !== 'ramp' && c0.maneuver !== 'fork' && c0.maneuver !== 'merge') c0.maneuver = 'turn';
          c0.modifier = md2;
        }
      }
    }
    steps = comb;
    // merge consecutive 'continue straight' onto the same name; drop zero-length steps;
    // fold a short step into the previous one when they are on the same road
    var out = [];
    for (i = 0; i < steps.length; i++) {
      var s = steps[i];
      var last = out[out.length - 1];
      if (last && last.maneuver !== 'depart' && s.maneuver !== 'arrive' && last.distance < 30 &&
          s.name === last.name && s.ref === last.ref &&
          (s.maneuver === 'fork' || s.maneuver === 'continue' || (s.modifier && s.modifier.indexOf('slight') === 0))) {
        last.distance += s.distance; last.duration += s.duration; continue;
      }
      if (last && s.maneuver === 'continue' && s.name === last.name && s.ref === last.ref && s.modifier === 'straight') {
        last.distance += s.distance; last.duration += s.duration; continue;
      }
      if (last && s.maneuver !== 'arrive' && s.maneuver !== 'depart' && s.distance < 1 && i < steps.length - 2) {
        last.distance += s.distance; last.duration += s.duration; continue;
      }
      out.push(s);
    }
    for (i = 0; i < out.length; i++) {
      s = out[i];
      if (s.maneuver === 'roundabout') {
        var ex = s._round ? Math.max(1, s._round.exits) : 1;
        s.exit = ex;
      }
      s.instruction = instruction(s, mode);
      s.distance = Math.round(s.distance * 10) / 10;
      s.duration = Math.round(s.duration * 10) / 10;
      delete s._edge; delete s._round; delete s._bearing;
    }
    return out;

    function instruction(s, md) {
      var onto = s.name ? ' onto ' + s.name : (s.ref ? ' onto ' + s.ref : '');
      var on = s.name ? ' on ' + s.name : (s.ref ? ' on ' + s.ref : '');
      var side = s.modifier && s.modifier.indexOf('left') >= 0 ? 'left' : 'right';
      switch (s.maneuver) {
        case 'depart': return (md === 'walk' ? 'Walk ' : 'Head ') + cardinal(s._bearing || 0) + on;
        case 'turn':
          if (s.modifier && s.modifier.indexOf('slight') === 0) return 'Slight ' + side + onto;
          if (s.modifier && s.modifier.indexOf('sharp') === 0) return 'Turn sharp ' + side + onto;
          return 'Turn ' + side + onto;
        case 'continue':
          if (s.modifier && s.modifier.indexOf('slight') === 0) return 'Slight ' + side + onto;
          return s.name || s.ref ? 'Continue' + onto : 'Continue straight';
        case 'fork': return 'Keep ' + side + ' at the fork' + onto;
        case 'merge': return 'Merge' + (s.modifier && s.modifier !== 'straight' ? ' ' + side : '') + onto;
        case 'ramp': return 'Take the ramp on the ' + side + onto;
        case 'roundabout': return 'At the roundabout, take the ' + ordinal(s.exit || 1) + ' exit' + onto;
        case 'uturn': return 'Make a U-turn' + onto;
        case 'arrive': return 'Arrive at your destination';
        default: return 'Continue' + onto;
      }
    }
  }

  // ------------------------------------------------------------ public API
  function snap(params) {
    if (!G) throw new Error('Router not loaded');
    var mode = params.mode || 'car';
    var s = snapPoint(params.lonlat[0], params.lonlat[1], mode, params.maxDistance || 1500);
    if (!s) return null;
    var lb = label(s.edge);
    return { lon: round6(s.point[0]), lat: round6(s.point[1]), name: lb.name || lb.ref || '', distance: Math.round(s.distance * 10) / 10 };
  }

  var api = { load: load, route: route, snap: snap };

  if (scope && typeof scope.postMessage === 'function') {
    scope.onmessage = function (ev) {
      var msg = ev.data || {};
      var reply = function (ok, result, error) { scope.postMessage({ id: msg.id, ok: ok, result: result, error: error }); };
      try {
        if (msg.type === 'load') {
          load(new Uint8Array(msg.bytes)).then(function (r) {
            reply(true, r);
            // warm up off the UI thread so the first route is fast: spatial index + car costs
            setTimeout(function () { if (!GRID) buildGrid(); costs('car'); }, 0);
          }, function (e) { reply(false, null, String(e && e.message || e)); });
        } else if (msg.type === 'route') {
          reply(true, route(msg.params));
        } else if (msg.type === 'snap') {
          reply(true, snap(msg.params));
        } else if (msg.type === 'ping') {
          reply(true, 'pong');
        }
      } catch (e) {
        reply(false, null, String(e && e.message || e));
      }
    };
    scope.postMessage({ type: 'hello' });
  }
  return api;
}
