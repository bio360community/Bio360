// ════════════════════════════════════════════════════════
//  Bio360 · Supabase Data Layer
//  Include this file in all pages:
//  <script src="supabase.js"></script>
//  (after the supabase-js CDN script)
// ════════════════════════════════════════════════════════

const SB_URL = 'https://rsrezjpvrqjalcewfwqu.supabase.co';
const SB_KEY = 'sb_publishable_35MtkTFpRRz1P_WE4Ud1Fw_SoEkBuO_';

// Initialise client (supabase-js v2 CDN must load first)
let _sb = null;
function getSB() {
  if (!_sb) _sb = supabase.createClient(SB_URL, SB_KEY);
  return _sb;
}

// ── FALLBACK DATA (used when DB is empty or offline) ────
const FALLBACK = {
  leaderboard: [
    { name:'Rahul K.',    college:'MG University',         xp:2840, streak:21, rank:1 },
    { name:'Fathima M.',  college:'MG University',         xp:2410, streak:14, rank:2 },
    { name:'Sufail A.',   college:'University of Calicut', xp:2190, streak:14, rank:3 },
    { name:'Neethu S.',   college:'Kannur University',     xp:1920, streak:9,  rank:4 },
    { name:'Arjun P.',    college:'Kannur University',     xp:1740, streak:6,  rank:5 },
  ],
  activity: [
    { icon:'🔬', user_name:'Arjun P.',   action:'downloaded Genetics PYQ 2023',       created_at: new Date(Date.now()-120000).toISOString() },
    { icon:'🏆', user_name:'Fathima M.', action:'hit a 14-day quiz streak',            created_at: new Date(Date.now()-300000).toISOString() },
    { icon:'⚡', user_name:'Rahul K.',   action:'scored 100% on Biochemistry quiz',   created_at: new Date(Date.now()-480000).toISOString() },
    { icon:'🧬', user_name:'Neethu S.',  action:'joined CSIR NET study group',        created_at: new Date(Date.now()-720000).toISOString() },
    { icon:'🌟', user_name:'Priya V.',   action:'earned the Bio Guru badge',          created_at: new Date(Date.now()-960000).toISOString() },
  ],
  internships: [
    { title:'Summer Research Fellowship',    organization:'JNCASR',               location:'Bangalore',          type:'Research',   stipend:'₹10,000/mo', deadline:'2025-03-15', link:'https://jncasr.ac.in' },
    { title:'DBT Internship Programme 2025', organization:'Dept. of Biotechnology', location:'New Delhi',          type:'Government', stipend:'₹8,000/mo',  deadline:'2025-04-30', link:'https://dbt.gov.in'   },
    { title:'Student Research Project',      organization:'RGCB',                  location:'Thiruvananthapuram', type:'Research',   stipend:'₹5,000/mo',  deadline:'2025-06-10', link:'https://rgcb.res.in'  },
    { title:'KSCSTE Student Fellowship',     organization:'KSCSTE',                location:'Thiruvananthapuram', type:'Government', stipend:'₹3,000/mo',  deadline:'2025-05-31', link:'https://kscste.kerala.gov.in' },
  ],
  memberCount: 12,
};

// ── API FUNCTIONS ────────────────────────────────────────

/** Get member count */
async function getMemberCount() {
  try {
    const { count, error } = await getSB()
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return Math.max(count || 0, FALLBACK.memberCount);
  } catch {
    return FALLBACK.memberCount;
  }
}

/** Get leaderboard (top N by XP) */
async function getLeaderboard(limit = 5) {
  try {
    const { data, error } = await getSB()
      .from('profiles')
      .select('name, college, xp, streak')
      .order('xp', { ascending: false })
      .limit(limit);
    if (error || !data || data.length === 0) throw new Error('empty');
    return data.map((r, i) => ({ ...r, rank: i + 1 }));
  } catch {
    return FALLBACK.leaderboard.slice(0, limit);
  }
}

/** Get recent activity feed */
async function getActivityFeed(limit = 8) {
  try {
    const { data, error } = await getSB()
      .from('activity_feed')
      .select('icon, user_name, college, action, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data || data.length === 0) throw new Error('empty');
    return data;
  } catch {
    return FALLBACK.activity.slice(0, limit);
  }
}

/** Get active internships (deadline not passed) */
async function getInternships(limit = 6) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await getSB()
      .from('internships')
      .select('title, organization, location, type, stipend, deadline, link')
      .eq('is_active', true)
      .gte('deadline', today)
      .order('deadline', { ascending: true })
      .limit(limit);
    if (error || !data || data.length === 0) throw new Error('empty');
    return data;
  } catch {
    return FALLBACK.internships.slice(0, limit);
  }
}

/** Log activity to feed */
async function logActivity(type, userName, college, action, icon = '⚡') {
  try {
    await getSB().from('activity_feed').insert([{ type, user_name: userName, college, action, icon }]);
  } catch { /* silent fail */ }
}

/** Add a profile (on join) */
async function addProfile(name, college, department = 'Life Science') {
  try {
    const { data, error } = await getSB()
      .from('profiles')
      .insert([{ name, college, department, xp: 10, streak: 1 }])
      .select();
    if (error) throw error;
    await logActivity('join', name, college, 'joined the Bio360 community', '🌟');
    return data?.[0] || null;
  } catch { return null; }
}

/** Award XP to a user */
async function awardXP(userId, points) {
  try {
    const sb = getSB();
    const { data: user } = await sb.from('profiles').select('xp').eq('id', userId).single();
    if (!user) return;
    await sb.from('profiles').update({ xp: (user.xp || 0) + points }).eq('id', userId);
  } catch { /* silent */ }
}

// ── TIME HELPER ─────────────────────────────────────────
function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ── DEADLINE HELPER ──────────────────────────────────────
function daysUntil(dateStr) {
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  if (diff < 0)  return 'Expired';
  if (diff < 1)  return 'Today!';
  if (diff < 7)  return Math.ceil(diff) + ' days left';
  if (diff < 30) return Math.ceil(diff) + ' days left';
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

// ── COLLEGE ABBREVIATION ─────────────────────────────────
function shortCollege(c = '') {
  const map = {
    'university of calicut':   'Calicut Univ.',
    'mg university':           'MG Univ.',
    'kannur university':       'Kannur Univ.',
    'kerala university':       'Kerala Univ.',
    'mahatma gandhi univ.':    'MG Univ.',
    'mahatma gandhi university':'MG Univ.',
  };
  return map[c.toLowerCase()] || c.split(' ').slice(0,2).join(' ');
}

// ── AVATAR INITIALS ──────────────────────────────────────
function initials(name = '') {
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#00C896,#22D3EE)',
  'linear-gradient(135deg,#F59E0B,#FB7185)',
  'linear-gradient(135deg,#818CF8,#22D3EE)',
  'linear-gradient(135deg,#FB7185,#818CF8)',
  'linear-gradient(135deg,#22D3EE,#818CF8)',
  'linear-gradient(135deg,#00C896,#F59E0B)',
];

function avatarGradient(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

console.log('[Bio360] Supabase data layer ready ✓');
