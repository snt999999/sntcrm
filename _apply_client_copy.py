from pathlib import Path
root=Path(__file__).parent

def change(filename,before,after,count=1):
 p=root/filename
 s=p.read_text(encoding='utf-8')
 n=s.count(before)
 if n!=count: raise SystemExit(f'{filename}: expected {count} occurrence(s), found {n}: {before[:80]!r}')
 p.write_text(s.replace(before,after),encoding='utf-8')

change('index.html','<h3>Выберите дату и время</h3>','<h3>Онлайн-запись</h3>')
change('index.html','<div class="booking-entry-cta"><p>Выберите услугу и удобное время. Мы свяжемся с вами для подтверждения записи.</p><a class="btn btn--blue" href="zapis.html">Записаться онлайн</a></div>',
                    '<div class="booking-entry-cta"><p>Выберите услугу, дату и время. Мы подтвердим запись после проверки заявки.</p><a class="btn btn--blue" href="zapis.html">Записаться онлайн</a></div>')
import re
p=root/'index.html';s=p.read_text('utf-8');s,n=re.subn(r'\n\s*<small>солнцанет\.рф/[^<]+</small>', '',s)
if n!=8: raise SystemExit(f'Expected 8 decorative raw URL labels in cards, found {n}')
p.write_text(s,'utf-8')
change('zapis.html','content="Онлайн-заявка на замер, монтаж и автомобильные услуги СОЛНЦАНЕТ в Екатеринбурге. Подтверждение записи менеджером."',
                     'content="Онлайн-запись на автомобильные и архитектурные услуги СОЛНЦАНЕТ в Екатеринбурге. Заявка на бесплатный замер."')
change('assets/booking.js', '''         const seconds=Math.max(1,(Date.now()-start)/1000);
         uploadProgress(i,f.size*pct/100,f.size,text||`${pct}% · ~${(f.size*pct/100/1048576/seconds).toFixed(1)} МБ/с`);''',
'''         uploadProgress(i,f.size*pct/100,f.size,text||`Загружаем файл: ${pct}%`);''')
change('assets/booking.js','   const start=Date.now();\n   for(let attempt=0;attempt<2;attempt++){',
                           '   for(let attempt=0;attempt<2;attempt++){')
change('_worker.js','Доступ только для Сергея и Романа. Войдите в CRM под своей учётной записью.','Недостаточно прав. Войдите в CRM под учётной записью с нужными разрешениями.')
for f in ['index.html','zapis.html']:
 p=root/f;s=p.read_text('utf-8');s=s.replace('client-clear-copy-20261110-v1','client-public-clean-20261110-v2');p.write_text(s,'utf-8')
change('service-worker.js','solncanet-client-clear-copy-20261110-v1','solncanet-client-public-clean-20261110-v2')
print('Edited client copy successfully')
