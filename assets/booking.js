'use strict';
(() => {
 const $=id=>document.getElementById(id);
 const state={step:1,direction:'',kind:'',serviceId:'',date:'',time:'',month:'',services:[],turnstileToken:'',turnstileId:null,started:Date.now(),requestKey:crypto.randomUUID(),submitted:null,files:[],busy:false,uploading:false,abortRequested:false,activeXhr:null,activeSession:null,uploaded:new Set(),slots:[],ready:false,uploadAvailable:false,maxFileSizeBytes:10*1024*1024,siteKey:null};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ekbDay=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Yekaterinburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const dateUTC=s=>new Date(s+'T12:00:00Z');
 const plusDays=(s,n)=>{const d=dateUTC(s);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const monthFirst=s=>s.slice(0,7)+'-01';
 const nextMonth=(s,delta)=>{const d=dateUTC(s);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+delta);return d.toISOString().slice(0,10)};
 const money=(v,s)=>v===null||v===undefined?'Цена уточняется':Number(v)===0?'Бесплатно':'от '+Number(v).toLocaleString('ru-RU')+' ₽'+(s?.direction==='Архитектура'&&s?.kind==='Монтаж'?'/м²':s?.name==='Бронирование порогов'?'/шт.':'');
 const alert=(message,good=false)=>{const e=$('bookingAlert');e.textContent=message;e.classList.toggle('good',good);e.hidden=!message;};
 const api=async (url,init={})=>{const r=await fetch(url,{cache:'no-store',...init});const raw=await r.text();let d;try{d=JSON.parse(raw)}catch{throw new Error('Сервер вернул некорректный ответ. Проверьте Cloudflare Pages Functions.');}if(!r.ok||!d.ok)throw new Error(d.error||'Ошибка соединения');return d;};
 const service=()=>state.services.find(s=>s.id===state.serviceId);
 function step(n){state.step=n;alert('');const measure=state.kind==='Замер'&&state.direction==='Архитектура';$('bookingProgress').classList.toggle('is-measure',measure);const contactProgress=$('bookingProgress').querySelector('span:nth-child(3)');if(contactProgress)contactProgress.innerHTML=(measure?'2':'3')+' <b>Контакты</b>';document.querySelectorAll('.booking-step').forEach(x=>x.hidden=Number(x.dataset.step)!==n);document.querySelectorAll('#bookingProgress span').forEach((x,i)=>{x.classList.toggle('current',i+1===n);x.classList.toggle('done',i+1<n)});$('bookingBack').hidden=n===1;$('bookingNext').hidden=n===3;$('bookingNavigation').hidden=n===3;validate();if(n===2)renderCalendar();if(n===3){summary();renderTurnstile();}window.scrollTo({top:0,behavior:'smooth'});}
 function validate(){const allowed=state.step===1?Boolean(state.serviceId):state.step===2?Boolean(state.date&&state.time):true;$('bookingNext').disabled=!allowed;}
 function clearScheduleSelection(){
   state.date='';state.time='';state.slots=[];
   $('bookingSlots').innerHTML='<span class="booking-hint">Выберите дату в календаре</span>';
 }
 function selectDirection(direction){
   if(state.direction===direction)return; // Re-selecting the same direction must not erase a previous choice.
   state.direction=direction;state.kind=direction==='Авто'?'Авто':'';state.serviceId='';clearScheduleSelection();
   document.querySelectorAll('[data-direction]').forEach(x=>x.classList.toggle('selected',x.dataset.direction===direction));
   $('bookingKinds').hidden=direction!=='Архитектура';$('bookingServiceBox').hidden=direction==='Архитектура';
   document.querySelectorAll('[data-kind]').forEach(x=>x.classList.remove('selected'));
   updateServices();
 }
 function selectKind(kind){
   if(state.kind===kind){if(kind==='Замер')step(3);return;}
   state.kind=kind;state.serviceId='';clearScheduleSelection();
   document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('selected',x.dataset.kind===kind));
   if(kind==='Замер'){
     // Measurement is a callback request, not a timed service reservation.
     $('bookingServiceBox').hidden=true;
     const leadService=state.services.find(s=>s.direction==='Архитектура'&&s.kind==='Замер'&&s.name==='Замер / консультация') || state.services.find(s=>s.direction==='Архитектура'&&s.kind==='Замер');
     if(!leadService){alert('Замер временно недоступен. Позвоните нам.');return;}
     state.serviceId=leadService.id;step(3);return;
   }
   $('bookingServiceBox').hidden=false;updateServices();
 }
 function updateServices(){const options=state.services.filter(s=>s.direction===state.direction&&s.kind===state.kind);
   $('bookingService').innerHTML='<option value="">Выберите услугу</option>'+options.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
   $('bookingServiceHint').textContent=options.length?'Выберите услугу, чтобы увидеть минимальную цену и продолжительность.':'Пока нет опубликованных услуг этого типа. Уточните возможность записи по телефону.';
   validate();}
 function pickService(id){
   if(id!==state.serviceId){state.serviceId=id;clearScheduleSelection();}
   const s=service();$('bookingServiceHint').textContent=s?`${money(s.price_from,s)} · ${s.duration_minutes} мин.`:'';
   validate();
 }
 function isDateAllowed(day){const today=ekbDay(),last=plusDays(today,30),dow=dateUTC(day).getUTCDay();return day>today&&day<=last&&dow!==0&&dow!==6;}
 function renderCalendar(){const d=dateUTC(state.month);$('bookingMonthTitle').textContent=new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric',timeZone:'UTC'}).format(d);
   const y=d.getUTCFullYear(),m=d.getUTCMonth(),firstDay=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(y,m+1,0)).getUTCDate();let html=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x=>`<span class="booking-weekday">${x}</span>`).join('');
   for(let i=0;i<firstDay;i++)html+='<span class="booking-day--empty"></span>';
   for(let i=1;i<=days;i++){const v=y+'-'+String(m+1).padStart(2,'0')+'-'+String(i).padStart(2,'0');html+=`<button type="button" class="booking-day ${v===state.date?'selected':''}" data-booking-day="${v}" ${!isDateAllowed(v)?'disabled':''}>${i}</button>`;}
   $('bookingCalendar').innerHTML=html;
   document.querySelectorAll('[data-booking-day]').forEach(b=>b.onclick=()=>pickDay(b.dataset.bookingDay));
   $('bookingPrevMonth').disabled=monthFirst(state.month)<=monthFirst(ekbDay());$('bookingNextMonth').disabled=monthFirst(state.month)>=monthFirst(plusDays(ekbDay(),30));
 }
 async function pickDay(day){state.date=day;state.time='';renderCalendar();validate();$('bookingSlots').textContent='Проверяем свободное время…';try{const r=await api('/booking-public?mode=slots&service='+encodeURIComponent(state.serviceId)+'&date='+encodeURIComponent(day));if(day!==state.date)return;state.slots=r.slots;$('bookingSlots').innerHTML=r.slots.length?r.slots.map(t=>`<button class="booking-slot" type="button" data-slot="${esc(t)}">${esc(t)}</button>`).join(''):'<span class="booking-hint">На эту дату свободных мест нет. Выберите другой день.</span>';document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{state.time=b.dataset.slot;document.querySelectorAll('[data-slot]').forEach(x=>x.classList.toggle('selected',x===b));validate();});}catch(e){$('bookingSlots').textContent=e.message;}}
 function summary(){
   const measure=state.kind==='Замер'&&state.direction==='Архитектура';
   const s=service();
   $('bookingSummary').innerHTML=measure
     ?'<b>Бесплатный замер</b><div>Оставьте имя и телефон. Сотрудник позвонит и согласует удобную дату.</div>'
     :`<b>${esc(state.kind)} · ${esc(s?.name||'')}</b><div>${esc(state.date.split('-').reverse().join('.'))} в ${esc(state.time)} · Екатеринбург</div><div>${esc(money(s?.price_from,s))}</div>`;
   $('bookingAddressBox').hidden=measure||state.direction!=='Архитектура';
   $('bookingCarBox').hidden=state.direction!=='Авто';
 }
 function renderTurnstile(){if(!state.siteKey||state.turnstileId!==null||!state.ready)return;if(!window.turnstile){setTimeout(renderTurnstile,250);return;}state.turnstileId=window.turnstile.render('#bookingTurnstile',{sitekey:state.siteKey,callback:v=>state.turnstileToken=v,'expired-callback':()=>state.turnstileToken='','error-callback':()=>state.turnstileToken='' });}
 const normalizePhone=v=>{let d=v.replace(/\D/g,'');if(d.startsWith('8'))d='7'+d.slice(1);if(d.length===10&&d.startsWith('9'))d='7'+d;return d};
 async function submit(e){e.preventDefault();if(state.busy)return;
   const name=$('bookingName').value.trim(),phone=normalizePhone($('bookingPhone').value);
   if(name.length<2){alert('Введите имя клиента');return;}
   if(!/^7\d{10}$/.test(phone)){alert('Введите телефон в формате +7');return;}
   if(state.direction==='Архитектура'&&state.kind!=='Замер'&&$('bookingAddress').value.trim().length<5){alert('Введите адрес объекта');return;}
   if(state.direction==='Авто'&&$('bookingCar').value.trim().length<2){alert('Укажите марку и модель автомобиля');return;}
   if(!$('bookingConsent').checked){alert('Подтвердите согласие на обработку персональных данных');return;}
   if(state.siteKey&&!state.turnstileToken){alert('Пройдите проверку защиты от спама');return;}
   const files=state.uploadAvailable?Array.from($('bookingAttachments').files||[]):[];if(files.length>15){alert('Можно приложить не более 15 файлов');return;}
   if(files.some(f=>f.size>state.maxFileSizeBytes)){alert('Для Google Drive каждый файл должен быть не больше 10 МБ');return;}
   state.busy=true;const button=$('bookingSubmit');button.disabled=true;button.textContent='Отправляем заявку…';alert('');
   try{const r=await api('/booking-public',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestKey:state.requestKey,leadKind:state.kind==='Замер'&&state.direction==='Архитектура'?'Замер':null,serviceId:state.serviceId,date:state.date,time:state.time,name,phone:'+'+phone,address:$('bookingAddress').value,car:$('bookingCar').value,comment:$('bookingComment').value,consent:true,formStartedAt:state.started,website:$('bookingWebsite').value,turnstileToken:state.turnstileToken})});state.submitted=r;state.files=files;showSuccess();if(files.length)void uploadAll();}catch(error){alert(error.message);if(window.turnstile&&state.turnstileId!==null)window.turnstile.reset(state.turnstileId);state.turnstileToken='';}finally{state.busy=false;button.disabled=false;button.textContent='Отправить заявку';}
 }
 const bookingSessionKey='solncanet_public_booking_drive_v2';
 function savedUploadKey(file){return `solncanet_upload_${state.submitted.bookingId}_${encodeURIComponent(file.name)}_${file.size}_${file.lastModified}`;}
 function saveSession(){try{sessionStorage.setItem(bookingSessionKey,JSON.stringify({response:state.submitted,savedAt:Date.now()}));}catch{}}
 function showSuccess(){
   saveSession();$('bookingApp').hidden=true;$('bookingSuccess').hidden=false;
   $('bookingReference').textContent=state.submitted.reference||'';const measure=Boolean(state.submitted.measureLead);$('bookingSuccessMessage').textContent=measure?'Мы получили ваши контакты. Сотрудник свяжется с вами и согласует бесплатный замер. Дата и время пока не назначены.':'Выбранное время ещё не подтверждено. Менеджер проверит запись и свяжется с вами.';$('bookingSuccessHold').hidden=measure;$('bookingManageLinkBox').hidden=measure;
   $('bookingManageLink').value=location.origin+'/zapis.html?manage='+encodeURIComponent(state.submitted.manageToken);
   $('bookingUploadPanel').hidden=!state.uploadAvailable;if(state.uploadAvailable)renderUploadList();
   window.scrollTo({top:0,behavior:'smooth'});
 }
 function onExtraFiles(){
   const extra=Array.from($('bookingExtraFiles').files||[]);
   const unique=new Set(state.files.map(f=>`${f.name}:${f.size}:${f.lastModified}`));
   for(const f of extra){const k=`${f.name}:${f.size}:${f.lastModified}`;if(!unique.has(k)){state.files.push(f);unique.add(k);}}
   $('bookingExtraFiles').value='';
   if(state.files.length>15){state.files=state.files.slice(0,15);window.alert('Можно прикрепить не больше 15 файлов к одной заявке.');}
   const tooBig=state.files.filter(f=>f.size>state.maxFileSizeBytes);if(tooBig.length){state.files=state.files.filter(f=>f.size<=state.maxFileSizeBytes);window.alert('Файлы больше 10 МБ не добавлены: '+tooBig.map(f=>f.name).join(', '));}
   renderUploadList();
 }
 function renderUploadList(){
   const el=$('bookingUploads');
   el.innerHTML=state.files.map((f,i)=>`<div class="booking-upload-item" id="upload-${i}"><div class="booking-upload-head"><span><b>${esc(f.name)}</b><br><small>${(f.size/1048576).toFixed(1)} МБ</small></span><b id="upload-percent-${i}">0%</b></div><div class="booking-progress-track"><div class="booking-progress-bar" id="upload-bar-${i}"></div></div><div class="booking-upload-status" id="upload-status-${i}">Ожидает загрузки</div></div>`).join('');
   for(let i=0;i<state.files.length;i++)if(state.uploaded.has(savedUploadKey(state.files[i])))uploadProgress(i,state.files[i].size,state.files[i].size,'Файл прикреплён к заявке');
   $('bookingUploadStart').hidden=state.uploading;
   $('bookingUploadStart').textContent=state.files.length?'Загрузить / повторить неудачные':'Выберите фотографии или документы выше';
   $('bookingUploadStart').disabled=!state.files.length;
 }
 function uploadProgress(i,done,size,subtext){
   const pct=size>0?Math.min(100,Math.round(done*100/size)):0;
   const pc=$('upload-percent-'+i),bar=$('upload-bar-'+i),status=$('upload-status-'+i);
   if(pc)pc.textContent=pct+'%';if(bar)bar.style.width=pct+'%';if(status)status.textContent=subtext;
 }
 // Google Apps Script receives one file per request; the indicator shows browser
 // transfer and becomes 100% only after Drive AND Supabase acknowledge success.
 function singleFileXHR(file,token,onProgress){return new Promise((resolve,reject)=>{
   const xhr=new XMLHttpRequest();state.activeXhr=xhr;
   xhr.open('POST','/booking-upload');xhr.setRequestHeader('Authorization','Bearer '+token);
   xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(Math.min(95,Math.round(e.loaded*95/e.total)))};
   xhr.upload.onload=()=>onProgress(96,'Сохраняем в Google Drive…');
   xhr.onload=()=>{state.activeXhr=null;let data;try{data=JSON.parse(xhr.responseText)}catch{reject(new Error('Сервер загрузки вернул некорректный ответ'));return;}
     if(xhr.status<200||xhr.status>=300||!data.ok)reject(new Error(data.error||'Google Drive отклонил файл'));else resolve(data);
   };
   xhr.onerror=()=>{state.activeXhr=null;reject(new Error('Соединение прервалось, повторите загрузку'))};
   xhr.onabort=()=>{state.activeXhr=null;reject(new Error('Загрузка отменена'))};
   const form=new FormData();form.append('file',file,file.name);xhr.send(form);
 });}
 async function uploadOne(f,i){
   if(f.size>state.maxFileSizeBytes)throw new Error('Максимум 10 МБ на файл');
   if(state.abortRequested)throw new Error('Загрузка отменена');
   const start=Date.now();
   for(let attempt=0;attempt<2;attempt++){
     try{
       const r=await singleFileXHR(f,state.submitted.uploadToken,(pct,text)=>{
         const seconds=Math.max(1,(Date.now()-start)/1000);
         uploadProgress(i,f.size*pct/100,f.size,text||`${pct}% · ~${(f.size*pct/100/1048576/seconds).toFixed(1)} МБ/с`);
       });
       state.uploaded.add(savedUploadKey(f));
       uploadProgress(i,f.size,f.size,'Файл прикреплён к заявке в Google Drive');
       return r;
     }catch(e){if(state.abortRequested||attempt===1)throw e;await new Promise(resolve=>setTimeout(resolve,1000));}
   }
 }
 async function cancelUpload(){
   if(!state.uploading)return;
   state.abortRequested=true;
   if(state.activeXhr)state.activeXhr.abort();
 }
 async function uploadAll(){
   if(state.uploading||!state.files.length||!state.submitted||!state.uploadAvailable)return;
   state.uploading=true;state.abortRequested=false;
   const button=$('bookingUploadStart');button.hidden=true;
   const cancel=$('bookingUploadCancel');cancel.hidden=false;
   let errors=0;
   for(let i=0;i<state.files.length;i++){
     if(state.abortRequested)break;
     if(state.uploaded.has(savedUploadKey(state.files[i])))continue;
     try{await uploadOne(state.files[i],i)}catch(e){errors++;uploadProgress(i,0,state.files[i].size,'Ошибка: '+e.message+'. Можно повторить загрузку.');}
   }
   state.uploading=false;cancel.hidden=true;button.hidden=false;
   button.textContent=state.abortRequested?'Повторить незагруженные файлы':errors?'Повторить неудачные загрузки':state.files.every(f=>state.uploaded.has(savedUploadKey(f)))?'Все файлы прикреплены':'Загрузить выбранные файлы';
   button.disabled=!errors&&!state.abortRequested&&state.files.every(f=>state.uploaded.has(savedUploadKey(f)));
 }
 async function manageInit(raw){$('bookingApp').hidden=true;$('bookingManagePane').hidden=false;
   try{const d=await api('/booking-manage?token='+encodeURIComponent(raw));const b=d.booking;const date=b.startAt?new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Yekaterinburg',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(b.startAt)):'дата и время уточняются';$('bookingManageInfo').textContent=`Заявка № ${b.reference} · ${b.kind}: ${b.service} · ${date} (Екатеринбург). Статус: ${b.status}`;
     $('bookingManageForm').hidden=!['confirmed','change_requested','cancel_requested'].includes(b.status);}
   catch(e){$('bookingManageInfo').textContent=e.message;}
   let action='';document.querySelectorAll('[data-manage]').forEach(b=>b.onclick=()=>{action=b.dataset.manage;document.querySelectorAll('[data-manage]').forEach(x=>x.classList.toggle('selected',x===b));$('bookingManageChange').hidden=action!=='change';});
   $('bookingManageForm').onsubmit=async e=>{e.preventDefault();const out=$('bookingManageAlert');if(!action){out.textContent='Выберите перенос или отмену';out.hidden=false;return;}const b=$('bookingManageForm').querySelector('button[type=submit]');b.disabled=true;
     try{const r=await api('/booking-manage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:raw,action,date:$('bookingManageDate').value,time:$('bookingManageTime').value,comment:$('bookingManageComment').value})});out.textContent=r.message;out.classList.add('good');out.hidden=false;$('bookingManageForm').hidden=true;}catch(err){out.textContent=err.message;out.hidden=false;}finally{b.disabled=false;}};
 }
 async function init(){const manage=new URLSearchParams(location.search).get('manage');if(manage){await manageInit(manage);return;}try{
   const r=await api('/booking-public?mode=config');$('bookingLoading').hidden=true;state.services=r.services||[];state.ready=r.ready;state.siteKey=r.turnstileSiteKey||null;state.uploadAvailable=!!r.uploadAvailable;state.maxFileSizeBytes=r.maxFileSizeBytes||10*1024*1024;state.month=monthFirst(ekbDay());
   if(!r.ready){$('bookingLoading').hidden=false;$('bookingLoading').textContent=r.notice||'Онлайн-запись готовится к запуску. Для уточнения даты свяжитесь с нами по телефону.';return;}
   if(!state.services.length){$('bookingLoading').hidden=false;$('bookingLoading').textContent='Онлайн-запись пока закрыта: услуги ещё не опубликованы. Позвоните нам для записи.';return;}
   if(r.privacyUrl){$('bookingPrivacyLink').href=r.privacyUrl;}
   else{$('bookingPrivacyLink').replaceWith(document.createTextNode('условиями обработки данных для связи по заявке'));}
   if(!state.uploadAvailable){
     $('bookingAttachments').disabled=true;$('bookingExtraFiles').disabled=true;
     $('bookingAttachmentHint').textContent='Прикрепление файлов пока недоступно. Заявку можно отправить без них — менеджер свяжется с вами.';
   }
   $('bookingWizard').hidden=false;step(1);
   document.querySelectorAll('[data-direction]').forEach(x=>x.onclick=()=>selectDirection(x.dataset.direction));
   document.querySelectorAll('[data-kind]').forEach(x=>x.onclick=()=>selectKind(x.dataset.kind));
   $('bookingService').onchange=e=>pickService(e.target.value);
   $('bookingPrevMonth').onclick=()=>{state.month=nextMonth(state.month,-1);renderCalendar()};
   $('bookingNextMonth').onclick=()=>{state.month=nextMonth(state.month,1);renderCalendar()};
   document.querySelectorAll('[data-booking-back]').forEach(b=>b.onclick=()=>step(state.step===3&&state.kind==='Замер'?1:Math.max(1,state.step-1)));$('bookingNext').onclick=()=>step(Math.min(3,state.step+1));
   $('bookingSubmitForm').onsubmit=submit;
   $('bookingCopyLink').onclick=()=>navigator.clipboard.writeText($('bookingManageLink').value).then(()=>{$('bookingCopyLink').textContent='Скопировано';}).catch(()=>{$('bookingManageLink').select();});
   $('bookingUploadStart').onclick=uploadAll;
   $('bookingUploadCancel').onclick=cancelUpload;
   $('bookingExtraFiles').onchange=onExtraFiles;
   const pending=sessionStorage.getItem(bookingSessionKey);let saved=null;try{saved=JSON.parse(pending||'null')}catch{}
   if(saved?.response?.bookingId&&saved?.response?.manageToken&&saved?.response?.uploadToken && Date.now()-saved.savedAt<48*3600_000 && !new URLSearchParams(location.search).has('new')){state.submitted=saved.response;showSuccess();}
 }catch(e){$('bookingLoading').textContent='Онлайн-запись временно недоступна: '+e.message+'. Позвоните нам по указанному номеру.';}}
 init();
})();
