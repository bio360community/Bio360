// ════════════════════════════════════════════════════════
//  Bio360 · Cmd+K Command Bar
//  Drop into any page after supabase.js:
//  <script src="cmdbar.js"></script>
// ════════════════════════════════════════════════════════

(function(){
const CSS = `
#cb-overlay{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);align-items:flex-start;justify-content:center;padding-top:12vh;}
#cb-overlay.open{display:flex;}
#cb-box{background:#111D2C;border:1px solid rgba(0,200,150,.2);border-radius:14px;width:100%;max-width:580px;overflow:hidden;box-shadow:0 0 60px rgba(0,200,150,.12),0 24px 60px rgba(0,0,0,.6);}
#cb-input-row{display:flex;align-items:center;gap:10px;padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.06);}
#cb-icon{font-size:18px;flex-shrink:0;}
#cb-input{flex:1;background:transparent;border:none;outline:none;font-family:'Satoshi','Cabinet Grotesk',sans-serif;font-size:16px;color:#EDF2F7;}
#cb-input::placeholder{color:#3d5166;}
#cb-kbd{font-size:11px;color:#3d5166;font-family:'JetBrains Mono',monospace;background:#172236;border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:2px 8px;flex-shrink:0;}
#cb-results{max-height:380px;overflow-y:auto;}
#cb-results::-webkit-scrollbar{width:4px;}
#cb-results::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.cb-section{padding:.5rem 0;}
.cb-section-label{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#3d5166;padding:.25rem 1.25rem .4rem;font-family:'JetBrains Mono',monospace;}
.cb-item{display:flex;align-items:center;gap:12px;padding:.65rem 1.25rem;cursor:pointer;transition:background .15s;text-decoration:none;}
.cb-item:hover,.cb-item.active{background:rgba(0,200,150,.07);}
.cb-item-ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.cb-item-main{flex:1;min-width:0;}
.cb-item-title{font-size:14px;font-weight:500;color:#EDF2F7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cb-item-sub{font-size:11px;color:#94A3B8;font-family:'JetBrains Mono',monospace;margin-top:1px;}
.cb-item-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;flex-shrink:0;}
.cb-footer{display:flex;align-items:center;gap:1rem;padding:.6rem 1.25rem;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:#3d5166;font-family:'JetBrains Mono',monospace;}
.cb-footer span{display:flex;align-items:center;gap:4px;}
.cb-footer kbd{background:#172236;border:1px solid rgba(255,255,255,.06);border-radius:3px;padding:1px 6px;font-size:10px;}
#cb-empty{padding:2.5rem;text-align:center;font-size:14px;color:#3d5166;}
`;

const DATA = {
  pyqs:[
    {title:'Microbiology PYQ 2023 — Calicut University',sub:'BSc Microbiology · Sem 4',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🧫',url:'community.html'},
    {title:'Biochemistry PYQ 2023 — Calicut University',sub:'BSc Biochemistry · Sem 3',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🔬',url:'community.html'},
    {title:'Genetics PYQ 2022 — MG University',sub:'BSc Biotechnology · Sem 4',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🧬',url:'community.html'},
    {title:'Cell Biology PYQ 2023 — Kannur University',sub:'BSc Zoology · Sem 3',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🔭',url:'community.html'},
    {title:'Molecular Biology PYQ 2022 — Calicut University',sub:'BSc Biotechnology · Sem 5',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🧬',url:'community.html'},
    {title:'Botany PYQ 2023 — Kerala University',sub:'BSc Botany · Sem 2',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🌿',url:'community.html'},
    {title:'Zoology PYQ 2023 — MG University',sub:'BSc Zoology · Sem 3',tag:'PYQ',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🐛',url:'community.html'},
    {title:'CSIR NET Life Science 2022 Paper',sub:'CSIR NET · Units 1–13',tag:'CSIR',tagC:'rgba(245,158,11,.1)',tagTx:'#F59E0B',ico:'📄',url:'community.html'},
  ],
  internships:[
    {title:'JNCASR Summer Research Fellowship',sub:'Bangalore · Research · ₹10,000/mo',tag:'OPEN',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🔬',url:'elitetrack.html'},
    {title:'DBT Internship Programme 2025',sub:'New Delhi · Government · ₹8,000/mo',tag:'OPEN',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🏛️',url:'elitetrack.html'},
    {title:'RGCB Student Research Project',sub:'Thiruvananthapuram · Research · ₹5,000/mo',tag:'OPEN',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🧪',url:'elitetrack.html'},
    {title:'NIIST Summer Internship',sub:'Thiruvananthapuram · CSIR Lab · ₹5,000/mo',tag:'OPEN',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🏛️',url:'elitetrack.html'},
    {title:'IISc Summer Research Programme',sub:'Bangalore · Research · ₹10,000/mo · CGPA 8.5+',tag:'OPEN',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🎓',url:'elitetrack.html'},
    {title:'Erasmus Mundus Joint Masters',sub:'Europe · Full Scholarship · €1,400/mo',tag:'GLOBAL',tagC:'rgba(129,140,248,.1)',tagTx:'#818CF8',ico:'🇪🇺',url:'elitetrack.html'},
    {title:'DAAD Research Scholarships',sub:'Germany · Research · €850/mo',tag:'GLOBAL',tagC:'rgba(129,140,248,.1)',tagTx:'#818CF8',ico:'🇩🇪',url:'elitetrack.html'},
  ],
  pages:[
    {title:'Daily Quiz',sub:'Answer today\'s biology questions · earn XP',tag:'FEATURE',tagC:'rgba(34,211,238,.1)',tagTx:'#22D3EE',ico:'📝',url:'community.html'},
    {title:'Leaderboard',sub:'Kerala student rankings by XP',tag:'FEATURE',tagC:'rgba(34,211,238,.1)',tagTx:'#22D3EE',ico:'🏆',url:'community.html'},
    {title:'CSIR NET Roadmap',sub:'6-month study plan · AI personalised',tag:'FEATURE',tagC:'rgba(34,211,238,.1)',tagTx:'#22D3EE',ico:'🎯',url:'index.html#ai'},
    {title:'Elite Track — Global Scholarships',sub:'Erasmus, DAAD, Fulbright, Chevening',tag:'NEW',tagC:'rgba(251,113,133,.1)',tagTx:'#FB7185',ico:'🌍',url:'elitetrack.html'},
    {title:'Skill OS — Career Tracks',sub:'Bioinformatics, Research, Pharma, AI Bio',tag:'NEW',tagC:'rgba(251,113,133,.1)',tagTx:'#FB7185',ico:'🧠',url:'skillos.html'},
    {title:'Blog — Study Guides',sub:'CSIR NET, internships, career paths',tag:'BLOG',tagC:'rgba(245,158,11,.1)',tagTx:'#F59E0B',ico:'📖',url:'blog.html'},
    {title:'Join Bio360',sub:'Create profile · unlock all features',tag:'JOIN',tagC:'rgba(0,200,150,.1)',tagTx:'#00C896',ico:'🚀',url:'login.html'},
  ],
};

const SHORTCUTS=[
  {key:'pyq',matches:['pyq','question paper','previous year','paper'],items:()=>DATA.pyqs},
  {key:'intern',matches:['intern','fellowship','scholarship','stipend','rgcb','jncasr','daad'],items:()=>DATA.internships},
];

function allItems(){return[...DATA.pyqs,...DATA.internships,...DATA.pages];}

function score(item,q){
  const t=(item.title+' '+item.sub).toLowerCase();
  if(t.includes(q)) return 2;
  const words=q.split(' ');
  const hits=words.filter(w=>w.length>1&&t.includes(w)).length;
  return hits/words.length;
}

function search(q){
  q=q.trim().toLowerCase();
  if(!q) return {pyqs:DATA.pyqs.slice(0,4),internships:DATA.internships.slice(0,3),pages:DATA.pages.slice(0,3)};
  // shortcut detection
  for(const s of SHORTCUTS){
    if(s.matches.some(m=>q.startsWith(m)||m.startsWith(q.slice(0,4)))){
      const items=s.items().filter(i=>score(i,q)>0||true).slice(0,6);
      return {[s.key]:items};
    }
  }
  // global search
  const all=allItems().map(i=>({...i,_s:score(i,q)})).filter(i=>i._s>0).sort((a,b)=>b._s-a._s).slice(0,8);
  if(!all.length) return null;
  return {results:all};
}

function itemHTML(item){
  return `<a class="cb-item" href="${item.url}" onclick="closeCB()">
    <div class="cb-item-ico" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)">${item.ico}</div>
    <div class="cb-item-main">
      <div class="cb-item-title">${item.title}</div>
      <div class="cb-item-sub">${item.sub}</div>
    </div>
    <span class="cb-item-tag" style="background:${item.tagC};color:${item.tagTx}">${item.tag}</span>
  </a>`;}

function sectionHTML(label,items){
  if(!items||!items.length) return '';
  return `<div class="cb-section"><div class="cb-section-label">${label}</div>${items.map(itemHTML).join('')}</div>`;}

function render(q){
  const res=search(q);
  const el=document.getElementById('cb-results');
  if(!res){el.innerHTML='<div id="cb-empty">No results for "'+q+'"</div>';return;}
  let html='';
  if(res.pyqs) html+=sectionHTML('PYQ Library',res.pyqs);
  if(res.internships) html+=sectionHTML('Internships & Fellowships',res.internships);
  if(res.pages) html+=sectionHTML('Pages & Features',res.pages);
  if(res.intern) html+=sectionHTML('Internships & Fellowships',res.intern);
  if(res.results) html+=sectionHTML('Results',res.results);
  el.innerHTML=html||'<div id="cb-empty">No results</div>';
}

function openCB(){
  document.getElementById('cb-overlay').classList.add('open');
  document.getElementById('cb-input').focus();
  document.getElementById('cb-input').value='';
  render('');
}
window.closeCB=function(){document.getElementById('cb-overlay').classList.remove('open');}

function init(){
  // Inject CSS
  const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
  // Inject HTML
  const d=document.createElement('div');
  d.innerHTML=`<div id="cb-overlay" onclick="if(event.target===this)closeCB()">
    <div id="cb-box">
      <div id="cb-input-row">
        <span id="cb-icon">🔍</span>
        <input id="cb-input" placeholder="Search PYQs, internships, features..." autocomplete="off" spellcheck="false">
        <kbd id="cb-kbd">ESC</kbd>
      </div>
      <div id="cb-results"></div>
      <div class="cb-footer">
        <span><kbd>↑↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span><kbd>ESC</kbd> close</span>
        <span style="margin-left:auto">Bio360 Search</span>
      </div>
    </div>
  </div>`;
  document.body.appendChild(d);

  // Events
  document.getElementById('cb-input').addEventListener('input',e=>render(e.target.value));
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openCB();}
    if(e.key==='Escape')closeCB();
    if(e.key==='/'&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA'){e.preventDefault();openCB();}
  });

  // Add trigger button to nav if present
  setTimeout(()=>{
    const nav=document.querySelector('nav');
    if(nav&&!document.getElementById('cb-trigger')){
      const btn=document.createElement('button');
      btn.id='cb-trigger';
      btn.onclick=openCB;
      btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Search <kbd style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:1px 6px;font-size:10px;font-family:JetBrains Mono,monospace;margin-left:4px;">⌘K</kbd>';
      btn.style='display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#94A3B8;font-family:Satoshi,sans-serif;font-size:13px;padding:7px 14px;cursor:pointer;transition:all .2s;touch-action:manipulation;';
      btn.onmouseenter=()=>btn.style.borderColor='rgba(0,200,150,.3)';
      btn.onmouseleave=()=>btn.style.borderColor='rgba(255,255,255,.08)';
      const nc=nav.querySelector('.nav-cta,.nc');
      if(nc) nav.insertBefore(btn,nc); else nav.appendChild(btn);
    }
  },200);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();
