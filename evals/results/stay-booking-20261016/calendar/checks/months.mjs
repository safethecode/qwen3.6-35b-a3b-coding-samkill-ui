import{pathToFileURL}from'node:url';import{resolve}from'node:path';import{writeFile}from'node:fs/promises';import assert from'node:assert/strict';
const[folder,out]=process.argv.slice(2),{makeCalendarMonth,shiftCalendarMonth}=await import(pathToFileURL(resolve(folder,'calendar-model.js')));let months=0,dates=0;
for(let y=2000;y<=2099;y++)for(let m=1;m<=12;m++){
  const month=`${y}-${String(m).padStart(2,'0')}`,data=makeCalendarMonth(month,'2000-01-01'),last=new Date(Date.UTC(y,m,0)).getUTCDate();
  assert.equal(data.days.length,last);assert.equal(data.leading,new Date(Date.UTC(y,m-1,1)).getUTCDay());
  for(let d=1;d<=last;d++){assert.equal(data.days[d-1].date,month+'-'+String(d).padStart(2,'0'));assert.equal(data.days[d-1].disabled,false);dates++;}
  for(const delta of[-12,-1,0,1,12]){const n=new Date(Date.UTC(y,m-1+delta,1)),expected=n.getUTCFullYear()<2000||n.getUTCFullYear()>2099?null:n.toISOString().slice(0,7);assert.equal(shiftCalendarMonth(month,delta),expected);}
  months++;
}
await writeFile(out,JSON.stringify({at:new Date().toISOString(),timezone:process.env.TZ||null,months,dates,status:'PASS',scope:'Every supported month/day and five month shifts;does not approve other calendar behavior or visual quality'},null,2));console.log(JSON.stringify({months,dates,timezone:process.env.TZ||null}));
