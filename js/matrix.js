// ── MATRIX ────────────────────────────────────────────────────
function initMx(){

  const CATS=[
    {k:'b64c', l:'Statki\npowietrzne', sub:'B64C39 · bezzałogowe',              color:'#00c8ff', cat:'AR'},
    {k:'b64u', l:'Drony\n(UAV)',        sub:'B64U · systemy dronów',             color:'#40d8ff', cat:'AR'},
    {k:'g05d', l:'Sterowanie\npojazd.', sub:'G05D1 · autonomizacja',             color:'#80e8ff', cat:'AR'},
    {k:'g06n', l:'AI\n/ ML',            sub:'G06N · uczenie maszynowe',          color:'#9d4edd', cat:'AI'},
    {k:'h04l', l:'Wykryw.\ncyberatk.',  sub:'H04L63 · ochrona sieci',            color:'#b87fff', cat:'AI'},
    {k:'g06f', l:'Zabez-\npieczenia',   sub:'G06F21 · bezp. systemów',           color:'#d4aaff', cat:'AI'},
    {k:'b33y', l:'Druk\n3D',            sub:'B33Y · wytwarzanie przyrostowe',    color:'#00e8a0', cat:'ZM'},
    {k:'b22f', l:'Meta-\nlurgia',        sub:'B22F · metalurgia proszków',        color:'#4db860', cat:'ZM'},
    {k:'c08l', l:'Kom-\npozyta',         sub:'C08L · polimery i kompozyty',      color:'#88cc88', cat:'ZM'},
  ];

  const MAT={
    BG: {b64c:0,  b64u:0,  g05d:0,  g06n:5,   h04l:0,  g06f:4,  b33y:3,  b22f:1,  c08l:6  },
    CZ: {b64c:27, b64u:4,  g05d:11, g06n:6,   h04l:0,  g06f:20, b33y:71, b22f:15, c08l:65 },
    EE: {b64c:0,  b64u:0,  g05d:2,  g06n:0,   h04l:0,  g06f:0,  b33y:0,  b22f:0,  c08l:0  },
    FI: {b64c:43, b64u:14, g05d:72, g06n:130, h04l:4,  g06f:233,b33y:48, b22f:51, c08l:91 },
    LT: {b64c:7,  b64u:1,  g05d:16, g06n:12,  h04l:25, g06f:38, b33y:14, b22f:3,  c08l:78 },
    PL: {b64c:47, b64u:26, g05d:210,g06n:154, h04l:69, g06f:556,b33y:261,b22f:257,c08l:328},
    RO: {b64c:1,  b64u:0,  g05d:1,  g06n:0,   h04l:0,  g06f:3,  b33y:3,  b22f:4,  c08l:3  },
    SE: {b64c:4,  b64u:5,  g05d:84, g06n:72,  h04l:0,  g06f:129,b33y:35, b22f:42, c08l:78 },
    SK: {b64c:0,  b64u:2,  g05d:0,  g06n:2,   h04l:0,  g06f:2,  b33y:5,  b22f:0,  c08l:8  },
    TR: {b64c:5,  b64u:4,  g05d:4,  g06n:92,  h04l:12, g06f:93, b33y:8,  b22f:35, c08l:41 },
    HU: {b64c:7,  b64u:2,  g05d:28, g06n:37,  h04l:3,  g06f:207,b33y:93, b22f:60, c08l:181},
    LV: {b64c:0,  b64u:0,  g05d:0,  g06n:1,   h04l:0,  g06f:0,  b33y:2,  b22f:0,  c08l:0  },
  };

  const maxV={};
  CATS.forEach(cat=>{
    maxV[cat.k]=Math.max(...Object.values(MAT).map(r=>r[cat.k]||0),1);
  });

  function bg(v, cat){
    if(v===0) return 'rgba(7,15,32,.65)';
    const t=v/maxV[cat.k];
    if(cat.cat==='AR'){ return `rgba(${Math.round(t*14)},${Math.round(38+t*148)},${Math.round(78+t*168)},.72)`; }
    if(cat.k==='g06n'||cat.k==='h04l'){ return `rgba(${Math.round(30+t*80)},${Math.round(10+t*30)},${Math.round(100+t*130)},.70)`; }
    if(cat.k==='g06f'){ return `rgba(${Math.round(50+t*80)},${Math.round(10+t*20)},${Math.round(80+t*120)},.70)`; }
    return `rgba(${Math.round(t*14)},${Math.round(38+t*118)},${Math.round(78+t*138)},.68)`;
  }

  function fg(v, catK){
    if(v===0) return '#1a3050';
    const t=v/maxV[catK];
    return t>.6?'#d0eeff':t>.25?'#90c8e0':'#6090b0';
  }

  function catBar(cc){
    const total=cc.AR+cc.AI+cc.ZM||1;
    return`<div class="cat-bar-wrap">
      <div class="cat-seg" style="width:${cc.AR/total*100}%;background:#00c8ff"></div>
      <div class="cat-seg" style="width:${cc.AI/total*100}%;background:#9d4edd"></div>
      <div class="cat-seg" style="width:${cc.ZM/total*100}%;background:#00e8a0"></div>
    </div>`;
  }

  const rows=C.map(cc=>{
    const row=MAT[cc.id]||{};
    const col=duColor(cc.du);
    return`<tr>
      <td class="lbl" style="border-left:3px solid ${col}">
        <strong style="color:${col}">[${cc.id}] ${cc.name}</strong>
        <small>${cc.role}</small>
        ${catBar(cc)}
      </td>
      ${CATS.map(cat=>{
        const v=row[cat.k]||0;
        return`<td style="background:${bg(v,cat)}">
          <div style="color:${fg(v,cat.k)};font-family:'Share Tech Mono';font-size:18px;font-weight:600;line-height:1">${v||'—'}</div>
        </td>`;
      }).join('')}
      <td style="color:var(--c);font-family:'Share Tech Mono';font-size:18px">${cc.patents}</td>
    </tr>`;
  }).join('');

  const groupHdr=`<tr>
    <th class="lh" style="border:none;background:transparent"></th>
    <th colspan="3" style="color:var(--cat1);border-bottom:2px solid var(--cat1);font-size:14px">◈ Automatyzacja i Robotyka</th>
    <th colspan="3" style="color:var(--cat2);border-bottom:2px solid var(--cat2);font-size:14px">◈◈ AI i Cyberbezpieczeństwo</th>
    <th colspan="3" style="color:var(--cat3);border-bottom:2px solid var(--cat3);font-size:14px">◈◈◈ Zaawansowane Materiały</th>
    <th style="border:none;background:transparent"></th>
  </tr>`;

  document.getElementById('mx-container').innerHTML=`
    <div style="margin-bottom:14px">
      <h2 style="font-family:Orbitron;font-size:18px;color:var(--c);letter-spacing:3px">▦ MACIERZ PATENTÓW WG PODKATEGORII</h2>
      <p style="font-family:'Share Tech Mono';font-size:18px;color:var(--m);margin-top:3px">
        Liczba patentów EPO/PATSTAT 2020–2025 · 9 podkategorii · intensywność koloru = udział w max. kolumny
      </p>
    </div>
    <table class="mx">
      <thead>
        ${groupHdr}
        <tr>
          <th class="lh">Kraj · Rola · Podział kategorii</th>
          ${CATS.map(c=>`<th style="color:${c.color};border-bottom:2px solid ${c.color}44;min-width:72px">
            <div style="line-height:1.3">${c.l.replace('\n','<br>')}</div>
            <div style="font-family:'Share Tech Mono';font-size:14px;color:${c.color}88;margin-top:2px;white-space:normal;font-weight:400">${c.sub}</div>
          </th>`).join('')}
          <th style="color:var(--m)">Łącznie</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:14px;display:flex;gap:20px;flex-wrap:wrap;align-items:center">
      <span style="font-family:'Share Tech Mono';font-size:18px;color:var(--m)">INTENSYWNOŚĆ = udział w maksimum kolumny</span>
      <span style="display:flex;gap:10px">
        ${['0%','25%','50%','75%','100%'].map((l,i)=>{
          const t=i/4;
          const r=Math.round(t*14),g=Math.round(38+t*148),b=Math.round(78+t*168);
          return`<span style="display:flex;align-items:center;gap:4px">
            <span style="width:20px;height:10px;background:rgba(${r},${g},${b},.72);border-radius:1px;display:inline-block;border:1px solid rgba(0,180,255,.1)"></span>
            <span style="font-size:18px;color:var(--m);font-family:'Share Tech Mono'">${l}</span>
          </span>`;
        }).join('')}
      </span>
      <span style="margin-left:8px;display:flex;gap:10px;align-items:center;font-family:'Share Tech Mono';font-size:18px;color:var(--m)">
        PASEK:
        <span style="display:flex;gap:2px;align-items:center"><span style="width:18px;height:6px;background:var(--cat1);border-radius:1px;display:inline-block"></span>A&R</span>
        <span style="display:flex;gap:2px;align-items:center"><span style="width:18px;height:6px;background:var(--cat2);border-radius:1px;display:inline-block"></span>AI</span>
        <span style="display:flex;gap:2px;align-items:center"><span style="width:18px;height:6px;background:var(--cat3);border-radius:1px;display:inline-block"></span>ZM</span>
      </span>
    </div>
  `;
}