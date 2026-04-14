// ── REAL DATA FROM PATSTAT 4426 patents ───────────────────────
const C=[
  // id, iso, name, hub, role, spec, patents, du, high, color
  // cats: AR=Automatyzacja, AI=AI&Cyber, ZM=Zaawansowane materiały
  {id:'SE',iso:752,name:'Szwecja', hub:'partner',  role:'Strategic Tech Lead',    spec:'Autonomia ciężka, zaawansowane materiały, stealth',
   patents:449, du:2.77, high:86,  AR:93,  AI:201, ZM:155, color:'#3a88ff',
   orgs:['SCANIA CV AB','STORA ENSO OYJ','ASSA ABLOY AB','SANDVIK MACH. SOLUTIONS'],
   filary:['Autonomizacja','Zaawansowane materiały','Wytwarzanie przyrostowe']},

  {id:'FI',iso:246,name:'Finlandia',hub:'partner', role:'Intel & Vision',          spec:'Cyberbezpieczeństwo, systemy bezzałogowe, telekomunikacja',
   patents:686, du:2.95, high:188, AR:129, AI:367, ZM:190, color:'#ff6060',
   orgs:['ELISA OYJ','NOKIA TECHNOLOGIES OY','GOOGLE LLC','NOKIA SOLUTIONS'],
   filary:['Cyberbezpieczeństwo','Systemy Bezzałogowe','Telekomunikacja']},

  {id:'EE',iso:233,name:'Estonia', hub:'trojmorze',role:'Cyber-Resilience',        spec:'Automatyzacja i systemy bezzałogowe',
   patents:2,   du:3.50, high:1,   AR:2,   AI:0,   ZM:0,   color:'#00e8a0',
   orgs:['Autostore Technology AS','VITA INCLINATA TECH INC'],
   filary:['Autonomizacja']},

  {id:'LV',iso:428,name:'Łotwa',   hub:'trojmorze',role:'Micro-Systems',           spec:'Druk 3D, zaawansowane materiały',
   patents:3,   du:3.50, high:1,   AR:0,   AI:1,   ZM:2,   color:'#00c8ff',
   orgs:['3D STRONG SIA','ENTANGLE SIA','KLAPERIS ULDIS'],
   filary:['Wytwarzanie Przyrostowe (Druk 3D)','Zaawansowane Materiały','AI / Komunikacja']},

  {id:'LT',iso:440,name:'Litwa',   hub:'trojmorze',role:'Cyber & Component Lab',   spec:'Cyberbezpieczeństwo, bezpieczeństwo sieci, automatyzacja',
   patents:194, du:2.68, high:35,  AR:24,  AI:75,  ZM:95,  color:'#00c8ff',
   orgs:['EVONIK OPERATIONS GMBH','SIEMENS AG','BAYER AG [DE]','LLEIDANETWORKS'],
   filary:['Bezpieczeństwo Sieci','Cyberbezpieczeństwo','Autonomizacja']},

  {id:'PL',iso:616,name:'Polska',  hub:'trojmorze',role:'Integrator Systemów',     spec:'Autonomizacja, druk 3D, cyberbezpieczeństwo — największa baza patentowa',
   patents:1908,du:2.77, high:411, AR:283, AI:779, ZM:846, color:'#00c8ff',
   orgs:['ADVANCED NEW TECH. CO LTD','ALIBABA GROUP','INTEL CORP','ERICSSON TELEFON AB'],
   filary:['Autonomizacja','Wytwarzanie Przyrostowe (3D)','Cyberbezpieczeństwo i ochrona sieci']},

  {id:'CZ',iso:203,name:'Czechy',  hub:'trojmorze',role:'Drivetrain & Materials',  spec:'Wytwarzanie addytywne, zaawansowane materiały, autonomizacja',
   patents:219, du:2.68, high:43,  AR:42,  AI:26,  ZM:151, color:'#00c8ff',
   orgs:['ČVUT PRAHA','VUT V BRNE','UNIV. T. BATI VE ZLÍNĚ','VŠB-TU OSTRAVA'],
   filary:['Wytwarzanie Addytywne','Zaawansowane materiały','Autonomizacja']},

  {id:'SK',iso:703,name:'Słowacja',hub:'trojmorze',role:'Materials Lab',           spec:'Zaawansowane materiały, druk 3D, automatyzacja',
   patents:19,  du:2.68, high:3,   AR:2,   AI:4,   ZM:13,  color:'#00aacc',
   orgs:['ELEKTROTECHNICKÝ ÚSTAV SAV','SLOVENSKÁ TECHNICKÁ UNIV.','FIRST POINT A.S.'],
   filary:['Zaawansowane materiały','Druk 3D / Technologie przyrostowe','Autonomizacja']},

  {id:'HU',iso:348,name:'Węgry',   hub:'trojmorze',role:'Platform Hub',            spec:'Wytwarzanie przyrostowe, magazynowanie energii, AI i telekomunikacja',
   patents:618, du:2.78, high:146, AR:37,  AI:247, ZM:334, color:'#00c8ff',
   orgs:['ZEON CORP','LG ENERGY SOLUTION','QUALCOMM INC','IBM'],
   filary:['Wytwarzanie przyrostowe','Magazynowanie energii','Telekomunikacja']},

  {id:'RO',iso:642,name:'Rumunia', hub:'trojmorze',role:'Materials & Nano',        spec:'Nanotechnologia, druk 3D, materiały przyrostowe',
   patents:15,  du:2.80, high:5,   AR:2,   AI:3,   ZM:10,  color:'#ffb300',
   orgs:['INCDIE COMOTI','INST. CHIMIE MACRO. PETRU PONI','INFLPR'],
   filary:['Technologie przyrostowe (Druk 3D)','Nanotechnologia','Autonomizacja/AI']},

  {id:'BG',iso:100,name:'Bułgaria',hub:'trojmorze',role:'Cyber & Materials',       spec:'Cyberbezpieczeństwo / Blockchain, inżynieria materiałowa',
   patents:19,  du:2.42, high:1,   AR:0,   AI:9,   ZM:10,  color:'#60a0e0',
   orgs:['UNIV. ZA NATS. I SVETOVNO STOP.','ARTMONBAT AD','IKT PLATFORMI OOD'],
   filary:['Cyberbezpieczeństwo / Blockchain','Inżynieria Materiałowa','Big Data / Analityka']},

  {id:'TR',iso:792,name:'Turcja',  hub:'partner',  role:'Aero & Cyber Production', spec:'Cyberbezpieczeństwo, wytwarzanie przyrostowe, lotnictwo',
   patents:294, du:2.91, high:79,  AR:13,  AI:197, ZM:84,  color:'#ffb300',
   orgs:['TURKCELL TECHNOLOGY R&D','TUSAS TURKISH AEROSPACE','TURKCELL TECHNOLOGY'],
   filary:['Cyberbezpieczeństwo','Wytwarzanie Przyrostowe','Inżynieria Materiałowa']},
];

const ORGS=[
  // type: 'pub'=instytucja publiczna, 'prv'=firma prywatna
  {id:'SE_SCA', name:'Scania CV AB',       c:'SE',type:'prv',du:3.16,n:38},
  {id:'SE_STO', name:'Stora Enso',         c:'SE',type:'prv',du:2.17,n:30},
  {id:'SE_ASS', name:'Assa Abloy',         c:'SE',type:'prv',du:2.68,n:28},
  {id:'SE_SAN', name:'Sandvik Mach.',      c:'SE',type:'prv',du:3.20,n:10},
  {id:'FI_ELI', name:'Elisa OYJ',          c:'FI',type:'prv',du:3.14,n:51},
  {id:'FI_NOK', name:'Nokia Technologies', c:'FI',type:'prv',du:3.65,n:26},
  {id:'FI_GOO', name:'Google LLC [FI]',    c:'FI',type:'prv',du:3.59,n:22},
  {id:'FI_NNS', name:'Nokia Solutions',    c:'FI',type:'prv',du:2.95,n:19},
  {id:'PL_ANT', name:'Advanced New Tech.', c:'PL',type:'prv',du:2.86,n:69},
  {id:'PL_ALI', name:'Alibaba Group',      c:'PL',type:'prv',du:2.78,n:50},
  {id:'PL_INT', name:'Intel Corp [PL]',    c:'PL',type:'prv',du:3.67,n:46},
  {id:'PL_ERI', name:'Ericsson AB [PL]',   c:'PL',type:'prv',du:3.56,n:32},
  {id:'CZ_CVU', name:'ČVUT Praha',         c:'CZ',type:'pub',du:2.91,n:11},
  {id:'CZ_VUT', name:'VUT v Brně',         c:'CZ',type:'pub',du:2.55,n:11},
  {id:'CZ_BAT', name:'Univ. T. Bati',      c:'CZ',type:'pub',du:2.55,n:11},
  {id:'HU_ZEO', name:'Zeon Corp [HU]',     c:'HU',type:'prv',du:2.00,n:35},
  {id:'HU_LGE', name:'LG Energy Solution', c:'HU',type:'prv',du:2.17,n:24},
  {id:'HU_QCM', name:'Qualcomm Inc [HU]',  c:'HU',type:'prv',du:3.83,n:12},
  {id:'HU_IBM', name:'IBM [HU]',            c:'HU',type:'prv',du:3.73,n:11},
  {id:'LT_EVO', name:'Evonik Operations',  c:'LT',type:'prv',du:2.38,n:8},
  {id:'LT_SIE', name:'Siemens AG [LT]',    c:'LT',type:'prv',du:3.40,n:5},
  {id:'TR_TUR', name:'Turkcell Tech.',      c:'TR',type:'prv',du:3.17,n:18},
  {id:'TR_TUS', name:'TUSAS Aerospace',    c:'TR',type:'pub',du:3.73,n:21},
  {id:'BG_UNI', name:'Univ. UNSS [BG]',   c:'BG',type:'pub',du:2.67,n:3},
  {id:'RO_COM', name:'INCDIE COMOTI',       c:'RO',type:'pub',du:3.00,n:2},
  {id:'SK_STU', name:'Slov. Tech. Univ.',  c:'SK',type:'pub',du:3.00,n:2},
];

// Tech category nodes for network
const TECH_NODES=[
  {id:'CAT_AR',name:'A&R',   desc:'Automatyzacja\ni Robotyzacja', color:'#00c8ff'},
  {id:'CAT_AI',name:'AI/Cy', desc:'AI i\nCyberbezp.',            color:'#9d4edd'},
  {id:'CAT_ZM',name:'ZM',    desc:'Zaawansowane\nMateriały',      color:'#00e8a0'},
];

// ── LOOKUP MAPS ───────────────────────────────────────────────
const cMap   = Object.fromEntries(C.map(c => [c.iso, c]));
const cById  = Object.fromEntries(C.map(c => [c.id,  c]));
const TMORZE = ['PL','CZ','SK','HU','RO','BG','LT','LV','EE'];

// ── HELPER FUNCTIONS ──────────────────────────────────────────
function orgColor(o){ return o.type === 'pub' ? '#ff4040' : '#ffb300'; }

function duColor(du){
  if(du >= 3.4) return '#ff7020';
  if(du >= 3.0) return '#ffb300';
  if(du >= 2.75)return '#50b8d0';
  return '#2868a0';
}

function duClass(du){
  if(du >= 3.4) return 'du5';
  if(du >= 3.0) return 'du4';
  if(du >= 2.75)return 'du3';
  if(du >= 2.55)return 'du2';
  return 'du1';
}
