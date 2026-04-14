// ── MAP ───────────────────────────────────────────────────────
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

  g.append('path').datum(d3.geoGraticule()()).attr('fill','none').attr('stroke','rgba(0,80,160,.06)').attr('stroke-width','.4').attr('d',path);
  g.append('g').selectAll('path').data(allF.features).join('path').attr('class','cbg').attr('d',path);
  g.append('g').attr('class','focus-g').selectAll('path').data(focF).join('path')
    .attr('class', f => 'cfoc ' + duClass(cMap[+f.id]?.du || 0)).attr('d', path)
    .on('mousemove', (e,f) => showMapTip(e, cMap[+f.id]))
    .on('mouseleave', () => { document.getElementById('tip-map').style.opacity = '0'; });
  g.append('path').datum(topojson.mesh(world, world.objects.countries, (a,b) => a !== b))
    .attr('fill','none').attr('stroke','#0e2540').attr('stroke-width','.6').attr('d',path);

  // Centroids
  const cents = {};
  const adj = {SE:[0,-18],FI:[7,-7],LV:[0,0],LT:[0,4],PL:[0,4],CZ:[0,0],SK:[4,0],HU:[0,4],RO:[8,0],BG:[0,4],TR:[24,14],EE:[0,0]};
  focF.forEach(f => {
    const cc = cMap[+f.id]; if(!cc) return;
    let [cx,cy] = path.centroid(f);
    if(adj[cc.id]){ cx += adj[cc.id][0]; cy += adj[cc.id][1]; }
    cents[cc.id] = [cx, cy];
  });

  // Connections
  const coops = [
    ['PL','CZ',3],['PL','SE',3],['PL','LT',3],['PL','HU',2],['PL','FI',2],
    ['CZ','SK',4],['CZ','HU',3],['CZ','SE',2],
    ['SE','FI',5],['SE','EE',3],['SE','LV',2],['SE','LT',2],
    ['FI','EE',3],['FI','LT',2],['HU','RO',2],['HU','SK',3],['HU','TR',2],
    ['LT','LV',3],['LT','EE',3],['BG','RO',2],['BG','TR',2],
  ];
  const cg = g.append('g');
  coops.forEach(([a,b,s]) => {
    if(!cents[a] || !cents[b]) return;
    const [x1,y1] = cents[a], [x2,y2] = cents[b];
    const mx = (x1+x2)/2 + (y2-y1)*.1, my = (y1+y2)/2 - (x2-x1)*.1;
    cg.append('path').attr('d', `M${x1},${y1} Q${mx},${my} ${x2},${y2}`)
      .attr('class','conn').attr('stroke','#00aadd')
      .attr('stroke-width', s*.45+.3).attr('stroke-opacity',.18);
  });

  // Hubs with category breakdown arcs
  const hg = g.append('g').attr('class','hubs');
  const tip = document.getElementById('tip-map');
  C.forEach(cc => {
    if(!cents[cc.id]) return;
    const [cx,cy] = cents[cc.id];
    const r = Math.max(12, Math.sqrt(cc.patents)*2.0);
    const col = duColor(cc.du);
    const gh = hg.append('g').attr('transform',`translate(${cx},${cy})`).attr('cursor','pointer')
      .on('mousemove', e => showMapTip(e, cc))
      .on('mouseleave', () => { tip.style.opacity = '0'; });

    if(cc.du >= 3.0) gh.append('circle').attr('class','pa').attr('r',r+8).attr('fill','none').attr('stroke',col).attr('stroke-width','1.2').attr('opacity',.38);
    gh.append('circle').attr('r',r+3).attr('fill','none').attr('stroke',col).attr('stroke-width','1').attr('opacity',.42);
    gh.append('circle').attr('r',r).attr('fill',col+'26').attr('stroke',col).attr('stroke-width','2').attr('filter','url(#glm)');

    // 3-segment arc = category distribution (AR/AI/ZM)
    const total = cc.AR + cc.AI + cc.ZM || 1;
    let angle = -Math.PI/2;
    [[cc.AR,'#00c8ff'],[cc.AI,'#9d4edd'],[cc.ZM,'#00e8a0']].forEach(([v,c]) => {
      const end = angle + (v/total)*2*Math.PI;
      if(v > 0){
        const arc = d3.arc().innerRadius(r+4).outerRadius(r+8).startAngle(angle).endAngle(end);
        gh.append('path').attr('d', arc()).attr('fill',c).attr('opacity',.85);
      }
      angle = end;
    });

    // Patent count badge
    const br = Math.max(5, Math.sqrt(cc.patents));
    gh.append('circle').attr('cx',r-.5).attr('cy',-r+.5).attr('r',br+1.5).attr('fill','#05101e').attr('stroke',col).attr('stroke-width','1');
    gh.append('text').attr('x',r-.5).attr('y',-r+.5).attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('font-family','Share Tech Mono').attr('font-size', Math.min(8,br*1.6)).attr('fill',col).text(cc.patents);

    gh.append('text').attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('font-family','Orbitron').attr('font-size','10px').attr('font-weight','700').attr('fill','white').text(cc.id);
    gh.append('text').attr('y',r+13).attr('text-anchor','middle')
      .attr('font-family','Rajdhani').attr('font-size','10px').attr('font-weight','600').attr('fill',col).text(cc.name);
    gh.append('text').attr('y',r+23).attr('text-anchor','middle')
      .attr('font-family','Share Tech Mono').attr('font-size','7px').attr('fill','#6080a0').text(cc.role);
  });

  // Legend
  const lx = 10, ly = H-148;
  const lg = g.append('g').attr('transform',`translate(${lx},${ly})`);
  lg.append('rect').attr('x',-5).attr('y',-8).attr('width',186).attr('height',145).attr('fill','rgba(3,8,18,.92)').attr('stroke','rgba(0,150,220,.18)').attr('rx',3);
  lg.append('text').attr('y',6).attr('font-family','Orbitron').attr('font-size','7px').attr('letter-spacing','2px').attr('fill','#1a4060').text('DUAL-USE SKALA');
  [['≥3.4 Wysoki','#ff7020'],['3.0–3.4 Podwyższony','#ffb300'],['2.75–3.0 Umiarkowany','#50b8d0'],['<2.75 Niski','#2868a0']].forEach(([l,c],i) => {
    lg.append('circle').attr('cx',7).attr('cy',22+i*21).attr('r',6).attr('fill',c+'44').attr('stroke',c).attr('stroke-width','1.5');
    lg.append('text').attr('x',19).attr('y',27+i*21).attr('fill',c).attr('font-family','Rajdhani').attr('font-size','10px').attr('font-weight','600').text(l);
  });
  lg.append('text').attr('x',5).attr('y',108).attr('fill','#1a4060').attr('font-family','Orbitron').attr('font-size','7px').attr('letter-spacing','2px').text('KATEGORYZACJA ŁUKU');
  [['#00c8ff','A&R Automatyzacja'],['#9d4edd','AI Cyberbezp.'],['#00e8a0','ZM Materiały']].forEach(([c,l],i) => {
    lg.append('rect').attr('x',5).attr('y',115+i*10).attr('width',10).attr('height',6).attr('fill',c).attr('rx',1);
    lg.append('text').attr('x',20).attr('y',121+i*10).attr('fill',c).attr('font-family','Share Tech Mono').attr('font-size','7.5px').text(l);
  });
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
  try{
    world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
  } catch(e){
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
  const tip = document.getElementById('tip-map');
  const el  = document.getElementById('map-inner');
  const rect = el.getBoundingClientRect();
  const col = duColor(cc.du), pct = (cc.du/4*100).toFixed(0);
  const total = cc.AR + cc.AI + cc.ZM || 1;
  tip.innerHTML=`
    <h4>[${cc.id}] ${cc.name}</h4>
    <div class="role">${cc.role}</div>
    <p>${cc.spec}</p>
    <div class="krow"><span>Łączna baza:</span><span style="color:var(--c)">${cc.patents}</span></div>
    <div style="margin-top:5px;font-size:9px;color:var(--m)">Podział kategorii:</div>
    <div style="display:flex;gap:4px;margin-top:3px;font-family:Share Tech Mono;font-size:9px">
      <span style="color:#00c8ff">A&R: ${cc.AR}</span>
      <span style="color:#9d4edd">AI: ${cc.AI}</span>
      <span style="color:#00e8a0">ZM: ${cc.ZM}</span>
    </div>
    <div class="krow" style="margin-top:4px"><span>High DU (≥4):</span><span style="color:var(--a)">${cc.high}</span></div>
    <div class="krow"><span>Śr. Dual-Use:</span><span style="color:${col}">${cc.du.toFixed(2)}/4</span></div>
    <div class="dbt"><div class="dbf" style="width:${pct}%;background:${col}"></div></div>
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
