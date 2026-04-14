// ── NETWORK ───────────────────────────────────────────────────
function initNet(){
  const el = document.getElementById('net-inner');
  const W = el.clientWidth, H = el.clientHeight;
  const svg = d3.select('#net-svg').attr('viewBox',`0 0 ${W} ${H}`);
  svg.append('rect').attr('width',W).attr('height',H).attr('fill','#050e1c');
  const defs = svg.append('defs');
  const f = defs.append('filter').attr('id','gln').attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
  f.append('feGaussianBlur').attr('stdDeviation','4').attr('result','b');
  const mm = f.append('feMerge'); mm.append('feMergeNode').attr('in','b'); mm.append('feMergeNode').attr('in','SourceGraphic');

  const ctryN = C.map(c    => ({...c, nodeType:'country', r:Math.max(18, Math.sqrt(c.patents)*1.9)}));
  const orgN  = ORGS.map(o => ({...o, nodeType:'org',     r:Math.max(8,  Math.sqrt(o.n)*2.5)}));
  const techN = TECH_NODES.map(t => ({...t, nodeType:'tech', r:26}));
  const all   = [...ctryN, ...orgN, ...techN];
  const nm    = Object.fromEntries(all.map(n => [n.id, n]));

  // Each country connects to its dominant tech categories
  const cCat = {
    SE:['CAT_AR','CAT_AI','CAT_ZM'], FI:['CAT_AI','CAT_AR','CAT_ZM'],
    EE:['CAT_AR'],                   LV:['CAT_ZM','CAT_AI'],
    LT:['CAT_AI','CAT_ZM','CAT_AR'], PL:['CAT_AI','CAT_ZM','CAT_AR'],
    CZ:['CAT_ZM','CAT_AR','CAT_AI'], SK:['CAT_ZM','CAT_AI'],
    HU:['CAT_ZM','CAT_AI','CAT_AR'], RO:['CAT_ZM','CAT_AI'],
    BG:['CAT_AI','CAT_ZM'],          TR:['CAT_AI','CAT_ZM','CAT_AR'],
  };

  const LINKS = [];
  ORGS.forEach(o => LINKS.push({source:o.c, target:o.id, type:'org', s:Math.sqrt(o.n)}));
  Object.entries(cCat).forEach(([c,cats]) => cats.forEach(cat => LINKS.push({source:c, target:cat, type:'cat', s:1})));
  [
    ['SE','FI',5],['SE','PL',3],['SE','CZ',2],['SE','LT',2],['SE','EE',4],['SE','LV',2],
    ['FI','EE',3],['FI','LT',2],['PL','CZ',3],['PL','HU',3],['PL','LT',3],
    ['CZ','SK',4],['CZ','HU',3],['HU','RO',2],['HU','SK',3],['HU','TR',2],
    ['LT','LV',3],['LT','EE',3],['BG','RO',2],['BG','TR',2],
  ].forEach(([a,b,s]) => LINKS.push({source:a, target:b, type:'coop', s}));

  const links = LINKS.filter(l => nm[l.source] && nm[l.target]);
  const sim = d3.forceSimulation(all)
    .force('link',    d3.forceLink(links).id(d => d.id).distance(d => d.type==='coop'?110:d.type==='cat'?175:68).strength(d => d.type==='coop'?.22:.5))
    .force('charge',  d3.forceManyBody().strength(d => d.nodeType==='country'?-460:d.nodeType==='tech'?-220:-90))
    .force('center',  d3.forceCenter(W/2, H/2))
    .force('collide', d3.forceCollide().radius(d => d.r+8));

  const root = svg.append('g');
  svg.call(d3.zoom().scaleExtent([.25,3]).on('zoom', e => root.attr('transform', e.transform)));
  const tip = document.getElementById('tip-net');

  function drg(sim){ return d3.drag()
    .on('start', (e,d) => { if(!e.active) sim.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y; })
    .on('drag',  (e,d) => { d.fx=e.x; d.fy=e.y; })
    .on('end',   (e,d) => { if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }); }

  const lEl = root.append('g').selectAll('line').data(links).join('line')
    .attr('class',        d => 'nlink' + (d.type==='coop'?' coop':''))
    .attr('stroke',       d => d.type==='coop'?'#00aadd':d.type==='cat'?'#446688':'#1a4060')
    .attr('stroke-width', d => d.type==='coop' ? Math.max(1,d.s*.4) : .7);

  // Tech category nodes
  const tEl = root.append('g').selectAll('g').data(techN).join('g').attr('class','ni');
  tEl.append('circle').attr('r',d=>d.r).attr('fill',d=>d.color+'16').attr('stroke',d=>d.color).attr('stroke-width',1.5).attr('stroke-dasharray','5 2');
  tEl.append('text').attr('dy','-4px').attr('fill',d=>d.color).attr('font-size','11px').attr('font-family','Orbitron').attr('font-weight','700').text(d=>d.name);
  tEl.append('text').attr('dy','10px').attr('fill',d=>d.color).attr('font-size','8px').attr('opacity','.65').attr('font-family','Rajdhani').text(d=>d.desc.split('\n')[0]);
  tEl.append('text').attr('dy','20px').attr('fill',d=>d.color).attr('font-size','8px').attr('opacity','.65').attr('font-family','Rajdhani').text(d=>d.desc.split('\n')[1]||'');

  // Org nodes
  const oEl = root.append('g').selectAll('g').data(orgN).join('g').attr('class','no').call(drg(sim))
    .on('mousemove',  (e,d) => showNetTip(e,d,tip))
    .on('mouseleave', () => tip.style.opacity='0');
  oEl.append('circle').attr('r',d=>d.r).attr('fill',d=>orgColor(d)+'28').attr('stroke',d=>orgColor(d)).attr('stroke-width',1.5).attr('filter','url(#gln)');
  oEl.append('text').attr('dy',d=>-d.r-5).attr('fill',d=>orgColor(d)).attr('font-size','8px').attr('font-family','Share Tech Mono').text(d=>d.name.substring(0,16));

  // Country nodes
  const cEl = root.append('g').selectAll('g').data(ctryN).join('g').attr('class','nc').call(drg(sim))
    .on('mousemove',  (e,d) => showNetTip(e,d,tip))
    .on('mouseleave', () => tip.style.opacity='0')
    .on('click',      (e,d) => showInfo(d));

  cEl.filter(d => d.du >= 3.0).append('circle').attr('class','pa')
    .attr('r',d=>d.r+10).attr('fill','none').attr('stroke',d=>duColor(d.du)).attr('stroke-width',1).attr('opacity',.38);
  cEl.append('circle').attr('r',d=>d.r).attr('fill',d=>duColor(d.du)+'30').attr('stroke',d=>duColor(d.du)).attr('stroke-width',2.5).attr('filter','url(#gln)');

  // Category ring on country nodes
  cEl.each(function(d){
    const g = d3.select(this);
    const total = d.AR + d.AI + d.ZM || 1;
    let ang = -Math.PI/2;
    [[d.AR,'#00c8ff'],[d.AI,'#9d4edd'],[d.ZM,'#00e8a0']].forEach(([v,c]) => {
      const end = ang + (v/total)*2*Math.PI;
      if(v > 0){
        const arc = d3.arc().innerRadius(d.r+3).outerRadius(d.r+6).startAngle(ang).endAngle(end);
        g.append('path').attr('d',arc()).attr('fill',c).attr('opacity',.8);
      }
      ang = end;
    });
  });

  cEl.append('text').attr('dy','4px').attr('fill','white').attr('font-size','11px').attr('font-weight','700').attr('font-family','Orbitron').text(d=>d.id);
  cEl.append('text').attr('dy',d=>d.r+15).attr('fill',d=>duColor(d.du)).attr('font-size','9px').attr('font-weight','600').attr('font-family','Rajdhani').text(d=>d.name);

  sim.on('tick', () => {
    lEl.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    cEl.attr('transform', d => `translate(${d.x},${d.y})`);
    oEl.attr('transform', d => `translate(${d.x},${d.y})`);
    tEl.attr('transform', d => `translate(${d.x},${d.y})`);
  });
  window._netSim = sim;
}

function showNetTip(e, d, tip){
  const el   = document.getElementById('net-inner');
  const rect = el.getBoundingClientRect();
  const du   = d.du || 0, col = duColor(du);
  const total = (d.AR||0) + (d.AI||0) + (d.ZM||0);
  tip.innerHTML=`
    <h4>${d.name}</h4>
    ${d.role ? `<div class="role">${d.role}</div>` : ''}
    ${d.spec ? `<p style="margin-top:4px">${d.spec}</p>` : ''}
    ${total > 0 ? `<div style="margin-top:5px;display:flex;gap:6px;font-family:Share Tech Mono;font-size:9px">
      <span style="color:#00c8ff">A&R: ${d.AR}</span><span style="color:#9d4edd">AI: ${d.AI}</span><span style="color:#00e8a0">ZM: ${d.ZM}</span></div>` : ''}
    ${(d.patents||d.n) ? `<div class="krow"><span>Patenty:</span><span style="color:var(--c)">${d.patents||d.n}</span></div>` : ''}
    ${d.nodeType==='org' ? `<div class="krow"><span>Typ:</span><span style="color:${orgColor(d)}">${d.type==='pub'?'Instytucja publiczna':'Firma prywatna'}</span></div>` : ''}
    ${du ? `<div class="krow"><span>Dual-Use:</span><span style="color:${col}">${du.toFixed(2)}/4</span></div><div class="dbt"><div class="dbf" style="width:${(du/4*100).toFixed(0)}%;background:${col}"></div></div>` : ''}
  `;
  tip.style.opacity = '1';
  let lx = e.clientX - rect.left + 14, ly = e.clientY - rect.top - 20;
  if(lx + 260 > rect.width)  lx = e.clientX - rect.left - 270;
  if(ly + 230 > rect.height) ly = e.clientY - rect.top  - 240;
  tip.style.left = lx + 'px'; tip.style.top = ly + 'px';
}

function showInfo(d){
  const col   = duColor(d.du);
  const total = d.AR + d.AI + d.ZM;
  document.getElementById('infopanel').innerHTML=`
    <div class="ic" style="border-color:${col}55">
      <h4 style="color:${col}">[${d.id}] ${d.name}</h4>
      <div class="role">${d.role}</div>
      <p style="margin-top:4px">${d.spec}</p>
      <span class="tag" style="color:${d.hub==='trojmorze'?'var(--c)':'var(--a)'};margin-top:5px;display:inline-block">${d.hub==='trojmorze'?'★ TRÓJMORZE':'PARTNER'}</span>
      <div style="margin-top:10px;font-size:8px;color:var(--m);font-family:Share Tech Mono;margin-bottom:4px">PODZIAŁ KATEGORII:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        ${[['#00c8ff','A&R',d.AR],['#9d4edd','AI/Cy',d.AI],['#00e8a0','ZM',d.ZM]].map(([c,l,v])=>`
          <div style="text-align:center;background:${c}12;padding:5px;border-radius:2px;border:1px solid ${c}33">
            <div style="font-family:Orbitron;font-size:14px;color:${c}">${v}</div>
            <div style="font-size:8px;color:${c}99;font-family:Share Tech Mono">${l}</div>
          </div>`).join('')}
      </div>
      <div style="margin-top:8px;display:flex;gap:5px">
        <div style="flex:1;text-align:center;background:rgba(0,200,255,.07);padding:5px;border-radius:2px">
          <div style="font-family:Orbitron;font-size:15px;color:var(--c)">${total}</div>
          <div style="font-size:7px;color:var(--m);font-family:Share Tech Mono">łącznie</div>
        </div>
        <div style="flex:1;text-align:center;background:rgba(255,179,0,.07);padding:5px;border-radius:2px">
          <div style="font-family:Orbitron;font-size:15px;color:var(--a)">${d.high}</div>
          <div style="font-size:7px;color:var(--m);font-family:Share Tech Mono">high DU</div>
        </div>
      </div>
      <div class="krow" style="margin-top:7px"><span>Dual-Use śr.:</span><span style="color:${col}">${d.du.toFixed(2)}/4</span></div>
      <div class="dbt"><div class="dbf" style="width:${(d.du/4*100).toFixed(0)}%;background:${col}"></div></div>
      <div style="margin-top:8px;font-size:8px;color:var(--m);font-family:Share Tech Mono">PODMIOTY:</div>
      <div style="font-size:9px;font-family:Share Tech Mono;color:#80a8c8;line-height:1.8">${d.orgs.join('<br>')}</div>
      <div style="margin-top:7px;font-size:8px;color:var(--m);font-family:Share Tech Mono">FILARY:</div>
      <div>${d.filary.map(f=>`<span class="tag" style="color:var(--a)">${f}</span>`).join(' ')}</div>
    </div>
  `;
}
