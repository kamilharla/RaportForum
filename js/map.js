// ── MAP ───────────────────────────────────────────────────────

// DFI data: IB = niebieski, MD = czerwony
const DFI = {
  PL: {dfi:3.13, type:'MD'},
  EE: {dfi:1.76, type:'IB'},
  LT: {dfi:2.91, type:'MD'},
  LV: {dfi:3.20, type:'MD'},
  CZ: {dfi:1.11, type:'IB'},
  SK: {dfi:2.00, type:'IB'},
  HU: {dfi:1.62, type:'IB'},
  RO: {dfi:5.00, type:'MD'},
  BG: {dfi:3.13, type:'MD'},
  FI: {dfi:0.88, type:'IB'},
  SE: {dfi:0.61, type:'IB'},
  TR: {dfi:1.53, type:'IB'},
};

// Kolor wypełnienia kraju wg typu DFI
function dfiColor(id, alpha){
  const d = DFI[id];
  if(!d) return `rgba(13,32,53,${alpha||1})`;
  const a = alpha || 1;
  return d.type === 'MD'
    ? `rgba(180,40,40,${a})`
    : `rgba(20,80,180,${a})`;
}

// Kolor konturu / akcentu
function dfiStroke(id){
  const d = DFI[id];
  if(!d) return '#1e4a6a';
  return d.type === 'MD' ? '#ff6060' : '#40a0ff';
}

let mapSvg;

function buildMap(world){
  const el = document.getElementById('map-inner');
  const W = el.clientWidth, H = el.clientHeight;
  mapSvg.attr('viewBox', `0 0 ${W} ${H}`);
  mapSvg.selectAll('.mc').remove();

  const g = mapSvg.append('g').attr('class','mc');
  const allF = topojson.feature(world, world.objects.countries);
  const focF = allF.features.filter(f => new Set(C.map(c => c.iso)).has(+f.id));

  const proj = d3.geoMercator().fitExtent([[26,20],[W-26,H-20]], {type:'FeatureCollection', features:focF});
  const path = d3.geoPath().projection(proj);

  // Siatka
  g.append('path').datum(d3.geoGraticule()())
    .attr('fill','none').attr('stroke','rgba(0,80,160,.06)')
    .attr('stroke-width','.4').attr('d',path);

  // Wszystkie kraje (tło)
  g.append('g').selectAll('path').data(allF.features).join('path')
    .attr('class','cbg').attr('d',path);

  // Kraje fokusowane — kolor wg DFI
  g.append('g').attr('class','focus-g').selectAll('path').data(focF).join('path')
    .attr('class','cfoc')
    .attr('d', path)
    .attr('fill', f => dfiColor(cMap[+f.id]?.id, 0.55))
    .attr('stroke', f => dfiStroke(cMap[+f.id]?.id))
    .attr('stroke-width', '0.8')
    .on('mousemove', (e,f) => showMapTip(e, cMap[+f.id]))
    .on('mouseleave', () => { document.getElementById('tip-map').style.opacity = '0'; });

  // Granice
  g.append('path').datum(topojson.mesh(world, world.objects.countries, (a,b) => a !== b))
    .attr('fill','none').attr('stroke','#0e2540').attr('stroke-width','.6').attr('d',path);

  // Centroidy
  const cents = {};
  const adj = {SE:[0,-18],FI:[7,-7],LV:[0,0],LT:[0,4],PL:[0,4],CZ:[0,0],SK:[4,0],HU:[0,4],RO:[8,0],BG:[0,4],TR:[24,14],EE:[0,0]};
  focF.forEach(f => {
    const cc = cMap[+f.id]; if(!cc) return;
    let [cx,cy] = path.centroid(f);
    if(adj[cc.id]){ cx += adj[cc.id][0]; cy += adj[cc.id][1]; }
    cents[cc.id] = [cx, cy];
  });

  // Węzły krajów
  const hg = g.append('g').attr('class','hubs');
  const tip = document.getElementById('tip-map');

  C.forEach(cc => {
    if(!cents[cc.id]) return;
    const [cx,cy] = cents[cc.id];
    const d = DFI[cc.id] || {};
    const stroke = dfiStroke(cc.id);
    const fill   = dfiColor(cc.id, 0.18);
    const r = 22;

    const gh = hg.append('g')
      .attr('transform', `translate(${cx},${cy})`)
      .attr('cursor','pointer')
      .on('mousemove', e => showMapTip(e, cc))
      .on('mouseleave', () => { tip.style.opacity = '0'; });

    // Pulsowanie dla MD (wysokie DFI)
    if(d.type === 'MD')
      gh.append('circle').attr('class','pa').attr('r',r+8)
        .attr('fill','none').attr('stroke',stroke)
        .attr('stroke-width','1').attr('opacity',.3);

    // Zewnętrzny pierścień
    gh.append('circle').attr('r',r+3)
      .attr('fill','none').attr('stroke',stroke)
      .attr('stroke-width','1').attr('opacity',.35);

    // Koło główne
    gh.append('circle').attr('r',r)
      .attr('fill',fill).attr('stroke',stroke)
      .attr('stroke-width','2').attr('filter','url(#glm)');

    // Kod kraju
    gh.append('text')
      .attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('y', -5)
      .attr('font-family','Orbitron').attr('font-size','9px')
      .attr('font-weight','700').attr('fill','white')
      .text(cc.id);

    // Liczba patentów
    gh.append('text')
      .attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('y', 4)
      .attr('font-family','Share Tech Mono').attr('font-size','8px')
      .attr('fill',stroke).attr('opacity',.9)
      .text(cc.patents);

    // DFI pod kołem
    if(d.dfi !== undefined){
      gh.append('text')
        .attr('y', r+13).attr('text-anchor','middle')
        .attr('font-family','Share Tech Mono').attr('font-size','8px')
        .attr('fill',stroke)
        .text(`DFI ${d.dfi.toFixed(2)}`);

      gh.append('text')
        .attr('y', r+23).attr('text-anchor','middle')
        .attr('font-family','Share Tech Mono').attr('font-size','7px')
        .attr('fill', d.type==='MD' ? '#ff9090' : '#6090ff')
        .text(d.type);
    }
  });

  // Legenda
  const lx = 10, ly = H - 100;
  const lg = g.append('g').attr('transform',`translate(${lx},${ly})`);
  lg.append('rect').attr('x',-5).attr('y',-8).attr('width',160).attr('height',96)
    .attr('fill','rgba(3,8,18,.92)').attr('stroke','rgba(0,150,220,.18)').attr('rx',3);
  lg.append('text').attr('y',6).attr('font-family','Orbitron').attr('font-size','7px')
    .attr('letter-spacing','2px').attr('fill','#1a4060').text('WSKAŹNIK DFI');

  [['IB – Innovation-Based','#40a0ff'], ['MD – Market-Driven','#ff6060']].forEach(([l,c],i) => {
    lg.append('circle').attr('cx',8).attr('cy',22+i*22).attr('r',7)
      .attr('fill',c+'33').attr('stroke',c).attr('stroke-width','1.5');
    lg.append('text').attr('x',20).attr('y',27+i*22)
      .attr('fill',c).attr('font-family','Rajdhani').attr('font-size','11px')
      .attr('font-weight','600').text(l);
  });

  lg.append('text').attr('x',4).attr('y',72)
    .attr('fill','#2a5070').attr('font-family','Share Tech Mono')
    .attr('font-size','7px').text('● pulsowanie = MD (wysokie DFI)');
  lg.append('text').attr('x',4).attr('y',83)
    .attr('fill','#2a5070').attr('font-family','Share Tech Mono')
    .attr('font-size','7px').text('liczba w kole = pat. · DFI pod kołem');
}

async function initMap(){
  mapSvg = d3.select('#map-svg');
  const defs = mapSvg.append('defs');
  const sg = defs.append('linearGradient').attr('id','sg').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
  sg.append('stop').attr('offset','0%').attr('stop-color','#030b17');
  sg.append('stop').attr('offset','100%').attr('stop-color','#06152a');
  mapSvg.append('rect').attr('width','100%').attr('height','100%').attr('fill','url(#sg)');
  const glf = defs.append('filter').attr('id','glm').attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
  glf.append('feGaussianBlur').attr('stdDeviation','5').attr('result','b');
  const mm = glf.append('feMerge'); mm.append('feMergeNode').attr('in','b'); mm.append('feMergeNode').attr('in','SourceGraphic');

  let world;
  try {
    world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
  } catch(e) {
    mapSvg.append('text').attr('x','50%').attr('y','50%').attr('text-anchor','middle')
      .attr('fill','#ff4040').attr('font-family','Share Tech Mono').attr('font-size','13px')
      .text('Wymaga połączenia z internetem (CDN world-atlas)');
    return;
  }
  window._wc = world;
  buildMap(world);
}

function showMapTip(e, cc){
  if(!cc) return;
  const tip  = document.getElementById('tip-map');
  const el   = document.getElementById('map-inner');
  const rect = el.getBoundingClientRect();
  const d    = DFI[cc.id] || {};
  const stroke = dfiStroke(cc.id);
  const typeLabel = d.type === 'MD' ? 'Market-Driven' : d.type === 'IB' ? 'Innovation-Based' : '—';

  tip.innerHTML=`
    <h4>[${cc.id}] ${cc.name}</h4>
    <div class="role" style="color:${stroke}">${cc.role}</div>
    <p style="margin-top:4px">${cc.spec}</p>
    <div class="krow" style="margin-top:6px">
      <span>Patenty łącznie:</span>
      <span style="color:var(--c)">${cc.patents}</span>
    </div>
    ${d.dfi !== undefined ? `
    <div class="krow">
      <span>DFI:</span>
      <span style="color:${stroke};font-weight:700">${d.dfi.toFixed(2)}</span>
    </div>
    <div class="krow">
      <span>Typ:</span>
      <span style="color:${stroke}">${d.type} – ${typeLabel}</span>
    </div>
    <div class="dbt" style="margin-top:4px">
      <div class="dbf" style="width:${Math.min(d.dfi/5*100,100).toFixed(0)}%;background:${stroke}"></div>
    </div>` : ''}
    <div style="margin-top:6px;font-size:9px;color:var(--m)">Główne podmioty:</div>
    <div style="font-size:9px;font-family:Share Tech Mono;color:#80a8c8;line-height:1.8">${cc.orgs.slice(0,3).join('<br>')}</div>
  `;
  tip.style.opacity = '1';
  let lx = e.clientX - rect.left + 14, ly = e.clientY - rect.top - 20;
  if(lx + 260 > rect.width)  lx = e.clientX - rect.left - 270;
  if(ly + 270 > rect.height) ly = e.clientY - rect.top  - 280;
  tip.style.left = lx + 'px'; tip.style.top = ly + 'px';
}

new ResizeObserver(() => {
  if(mapI && document.getElementById('view-map').classList.contains('on') && window._wc)
    buildMap(window._wc);
}).observe(document.getElementById('map-inner'));