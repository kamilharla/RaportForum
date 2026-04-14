// ── STATE ─────────────────────────────────────────────────────
let mapI = false, netI = false, mxI = false;

// ── TAB SWITCH ────────────────────────────────────────────────
function show(id, el){
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
  document.getElementById('view-' + id).classList.add('on');
  document.getElementById('leg-net').style.display = id === 'net' ? 'block' : 'none';
  setTimeout(() => {
    if(id === 'map' && !mapI){ initMap(); mapI = true; }
    if(id === 'net' && !netI){ initNet(); netI = true; }
    if(id === 'mx'  && !mxI ){ initMx();  mxI  = true; }
    if(id === 'map' && mapI && window._wc) buildMap(window._wc);
  }, 40);
}

// ── FILTERS ───────────────────────────────────────────────────
function applyFilter(f, btn){
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const ok = id => {
    const cc = cById[id]; if(!cc) return true;
    if(f === 'all')       return true;
    if(f === 'trojmorze') return TMORZE.includes(id);
    if(f === 'AR')        return cc.AR > 0;
    if(f === 'AI')        return cc.AI > 0;
    if(f === 'ZM')        return cc.ZM > 0;
    return true;
  };
  if(netI){
    const s = d3.select('#net-svg');
    s.selectAll('.nc').style('opacity', d => ok(d.id) ? 1 : .07);
    s.selectAll('.no').style('opacity', d => ok(d.c)  ? 1 : .04);
    s.selectAll('.ni').style('opacity', .2);
    if(f === 'AR') s.selectAll('.ni').filter(d => d.id === 'CAT_AR').style('opacity', 1);
    if(f === 'AI') s.selectAll('.ni').filter(d => d.id === 'CAT_AI').style('opacity', 1);
    if(f === 'ZM') s.selectAll('.ni').filter(d => d.id === 'CAT_ZM').style('opacity', 1);
  }
  if(mapI){
    d3.select('#map-svg').selectAll('.hubs g').style('opacity', d => d && ok(d.id) ? 1 : .08);
    d3.select('#map-svg').selectAll('.cfoc').style('opacity', function(f_){
      const cc = cMap[+f_?.id]; return (!cc || ok(cc.id)) ? 1 : .18;
    });
  }
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('load', () => { initMap(); mapI = true; });
