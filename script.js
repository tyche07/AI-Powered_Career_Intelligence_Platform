const toastEl = document.getElementById('appToast');
const appToast = toastEl && window.bootstrap ? bootstrap.Toast.getOrCreateInstance(toastEl, {delay: 2400}) : null;
function notify(message) { if (!appToast) return; document.getElementById('toastText').textContent = message; appToast.show(); }
function getData(key) { try { return JSON.parse(sessionStorage.getItem(key) || '[]'); } catch { return []; } }
function setData(key, value) { sessionStorage.setItem(key, JSON.stringify(value)); }
function safeText(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

document.getElementById('mobileMenu')?.addEventListener('click', () => document.getElementById('sidebar')?.classList.toggle('open'));
document.getElementById('notifications')?.addEventListener('click', () => notify('You are all caught up.'));
document.querySelectorAll('[data-prompt]').forEach(btn => btn.addEventListener('click', () => {
  const input = document.getElementById('chatInput');
  if (input) { input.value = btn.dataset.prompt || ''; input.focus(); document.getElementById('career-chat')?.scrollIntoView({behavior:'smooth',block:'center'}); }
}));
document.querySelectorAll('.save-career').forEach(btn => btn.addEventListener('click', () => {
  const career = btn.dataset.career;
  const saved = getData('cc_saved_careers');
  if (!saved.includes(career)) saved.push(career);
  setData('cc_saved_careers', saved); renderSavedCareers(); notify(`${career} saved.`);
}));
function renderSavedCareers() {
  const container = document.getElementById('savedCareers'); if (!container) return;
  const saved = getData('cc_saved_careers');
  container.innerHTML = saved.length ? saved.map((name,i)=>`<span class="saved-chip">${safeText(name)} <button data-unsave="${i}" aria-label="Remove ${safeText(name)}"><i class="bi bi-x"></i></button></span>`).join('') : '<p class="text-secondary small mb-0">No saved paths yet.</p>';
  container.querySelectorAll('[data-unsave]').forEach(b=>b.addEventListener('click',()=>{const a=getData('cc_saved_careers');a.splice(Number(b.dataset.unsave),1);setData('cc_saved_careers',a);renderSavedCareers();}));
}
renderSavedCareers();

const search = document.getElementById('careerSearch'), category = document.getElementById('careerCategory');
function filterCareers() {
  document.querySelectorAll('.career-card').forEach(card => {
    const text = `${card.dataset.search} ${card.textContent}`.toLowerCase();
    const matchesText = !search || text.includes(search.value.toLowerCase());
    const matchesCategory = !category || category.value === 'all' || card.dataset.category === category.value;
    card.classList.toggle('d-none', !(matchesText && matchesCategory));
  });
}
search?.addEventListener('input', filterCareers); category?.addEventListener('change', filterCareers);

const profileForm = document.getElementById('careerProfileForm');
if (profileForm) {
  const fields = ['profileName','education','field','experience','interests','strengths','careerGoal'];
  const profile = JSON.parse(sessionStorage.getItem('cc_profile') || '{}');
  fields.forEach(id => { if (profile[id]) document.getElementById(id).value = profile[id]; });
  function updateCompleteness() {
    const completed = fields.filter(id => document.getElementById(id).value.trim()).length;
    const percent = Math.round(completed / fields.length * 100);
    const label = document.getElementById('profilePercent'); if(label) label.textContent = `${percent}%`;
    const bar = document.getElementById('profileProgress'); if(bar) bar.style.width = `${percent}%`;
  }
  fields.forEach(id => document.getElementById(id).addEventListener('input', updateCompleteness));
  updateCompleteness();
  profileForm.addEventListener('submit', e => { e.preventDefault(); const obj={}; fields.forEach(id=>obj[id]=document.getElementById(id).value.trim()); sessionStorage.setItem('cc_profile',JSON.stringify(obj)); notify('Career profile saved for this session.'); });
}

const skillForm = document.getElementById('skillForm');
if (skillForm) {
  const list = document.getElementById('skillList');
  function renderSkills() {
    const a=getData('cc_skills');
    list.innerHTML = a.length ? a.map((s,i)=>`<div class="skill-row"><div class="skill-row-copy"><strong>${safeText(s.name)}</strong><small>${['','Beginner','Developing','Comfortable','Strong','Advanced'][s.level]}</small></div><div class="skill-dots">${[1,2,3,4,5].map(n=>`<span class="${n<=s.level?'filled':''}"></span>`).join('')}</div><button class="icon-button" data-remove-skill="${i}" aria-label="Remove skill"><i class="bi bi-trash3"></i></button></div>`).join('') : '<p class="text-secondary small">No skills added yet.</p>';
    list.querySelectorAll('[data-remove-skill]').forEach(b=>b.addEventListener('click',()=>{const a=getData('cc_skills');a.splice(Number(b.dataset.removeSkill),1);setData('cc_skills',a);renderSkills();}));
  }
  skillForm.addEventListener('submit',e=>{e.preventDefault();const a=getData('cc_skills');a.push({name:document.getElementById('skillName').value.trim(),level:Number(document.getElementById('skillLevel').value)});setData('cc_skills',a);skillForm.reset();renderSkills();notify('Skill added.');});
  renderSkills();
}

const roadmapForm = document.getElementById('roadmapForm');
if (roadmapForm) {
  const list=document.getElementById('roadmapList');
  function renderRoadmap() {
    const a=getData('cc_roadmap'), done=a.filter(x=>x.done).length, percent=a.length?Math.round(done/a.length*100):0;
    document.getElementById('roadmapProgress').textContent=`${percent}% complete`;document.getElementById('roadmapBar').style.width=`${percent}%`;
    list.innerHTML=a.length?a.map((x,i)=>`<div class="roadmap-item ${x.done?'completed':''}"><label class="roadmap-check"><input type="checkbox" data-roadmap-check="${i}" ${x.done?'checked':''}><span></span></label><div class="roadmap-copy"><strong>${safeText(x.title)}</strong><small>${safeText(x.area)}</small></div><button class="icon-button" data-roadmap-delete="${i}" aria-label="Delete milestone"><i class="bi bi-trash3"></i></button></div>`).join(''):'<div class="empty-state compact"><i class="bi bi-journal-check"></i><h3>Your roadmap starts here</h3><p>Add a milestone to get started.</p></div>';
    list.querySelectorAll('[data-roadmap-check]').forEach(b=>b.addEventListener('change',()=>{const a=getData('cc_roadmap');a[Number(b.dataset.roadmapCheck)].done=b.checked;setData('cc_roadmap',a);renderRoadmap();}));
    list.querySelectorAll('[data-roadmap-delete]').forEach(b=>b.addEventListener('click',()=>{const a=getData('cc_roadmap');a.splice(Number(b.dataset.roadmapDelete),1);setData('cc_roadmap',a);renderRoadmap();}));
  }
  roadmapForm.addEventListener('submit',e=>{e.preventDefault();const a=getData('cc_roadmap');a.push({title:document.getElementById('roadmapTitle').value.trim(),area:document.getElementById('roadmapArea').value,done:false});setData('cc_roadmap',a);roadmapForm.reset();renderRoadmap();notify('Milestone added.');});
  renderRoadmap();
}

const opportunityForm = document.getElementById('opportunityForm');
if (opportunityForm) {
  const list=document.getElementById('opportunityList');
  function renderOpportunities(){const a=getData('cc_opportunities');list.innerHTML=a.length?a.map((x,i)=>`<div class="data-row"><div class="data-row-icon peach"><i class="bi bi-briefcase"></i></div><div class="data-row-copy"><strong>${safeText(x.role)}</strong><small>${safeText(x.org||'Organization not specified')} · ${safeText(x.status)}</small></div><button class="icon-button" data-remove-opportunity="${i}" aria-label="Remove opportunity"><i class="bi bi-trash3"></i></button></div>`).join(''):'<div class="empty-state compact"><i class="bi bi-briefcase"></i><h3>No opportunities tracked</h3><p>Add a role or program you want to research.</p></div>';list.querySelectorAll('[data-remove-opportunity]').forEach(b=>b.addEventListener('click',()=>{const a=getData('cc_opportunities');a.splice(Number(b.dataset.removeOpportunity),1);setData('cc_opportunities',a);renderOpportunities();}));}
  opportunityForm.addEventListener('submit',e=>{e.preventDefault();const a=getData('cc_opportunities');a.unshift({role:document.getElementById('opportunityRole').value.trim(),org:document.getElementById('opportunityOrg').value.trim(),status:document.getElementById('opportunityStatus').value});setData('cc_opportunities',a);opportunityForm.reset();renderOpportunities();notify('Opportunity added.');});renderOpportunities();
}

const goalForm = document.getElementById('goalForm');
if (goalForm) {
  const list=document.getElementById('goalList');
  function renderGoals(){const a=getData('cc_goals'),done=a.filter(x=>x.done).length,percent=a.length?Math.round(done/a.length*100):0;document.getElementById('totalGoals').textContent=a.length;document.getElementById('completedGoals').textContent=done;document.getElementById('goalProgress').textContent=`${percent}%`;list.innerHTML=a.length?a.map((x,i)=>`<div class="data-row"><input class="form-check-input" type="checkbox" data-goal-done="${i}" ${x.done?'checked':''} aria-label="Mark ${safeText(x.title)} complete"><div class="data-row-copy"><strong class="${x.done?'goal-done':''}">${safeText(x.title)}</strong><small>${x.due?`Target: ${safeText(x.due)}`:'No target date'}</small></div><button class="icon-button" data-goal-delete="${i}" aria-label="Delete goal"><i class="bi bi-trash3"></i></button></div>`).join(''):'<div class="empty-state compact"><i class="bi bi-bullseye"></i><h3>No goals yet</h3><p>Add one small goal to get started.</p></div>';list.querySelectorAll('[data-goal-done]').forEach(b=>b.addEventListener('change',()=>{const a=getData('cc_goals');a[Number(b.dataset.goalDone)].done=b.checked;setData('cc_goals',a);renderGoals();}));list.querySelectorAll('[data-goal-delete]').forEach(b=>b.addEventListener('click',()=>{const a=getData('cc_goals');a.splice(Number(b.dataset.goalDelete),1);setData('cc_goals',a);renderGoals();}));}
  goalForm.addEventListener('submit',e=>{e.preventDefault();const a=getData('cc_goals');a.push({title:document.getElementById('goalTitle').value.trim(),due:document.getElementById('goalDue').value,done:false});setData('cc_goals',a);goalForm.reset();renderGoals();notify('Goal added.');});renderGoals();
}

const chatForm=document.getElementById('chatForm');
chatForm?.addEventListener('submit',async e=>{
  e.preventDefault();const input=document.getElementById('chatInput'), message=input.value.trim();if(!message)return;
  const messages=document.getElementById('chatMessages');const user=document.createElement('p');user.className='user-message';user.textContent=message;messages.appendChild(user);input.value='';
  const pending=document.createElement('p');pending.className='assistant-message';pending.textContent='Thinking…';messages.appendChild(pending);
  try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message})});if(!res.ok)throw new Error('Request failed');const data=await res.json();pending.textContent=data.reply;}catch{pending.textContent='Career assistant demo is unavailable right now. You can still use the profile, career matches, skills, roadmap, opportunities, and goals pages.';}
});
