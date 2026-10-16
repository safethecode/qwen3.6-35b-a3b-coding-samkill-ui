import {makeCalendarMonth,shiftCalendarMonth} from './calendar-model.js';
export function resolveCalendarFocus(date,key,shift,today){
  const value=new Date(date+'T00:00:00Z'),days={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
  let result;
  if(Object.hasOwn(days,key))result=new Date(value.getTime()+days[key]*86400000).toISOString().slice(0,10);
  else if(key==='Home'||key==='End')result=new Date(value.getTime()+(key==='Home'?-value.getUTCDay():6-value.getUTCDay())*86400000).toISOString().slice(0,10);
  else if(key==='PageUp'||key==='PageDown'){
    const delta=(key==='PageUp'?-1:1)*(shift?12:1),month=shiftCalendarMonth(date.slice(0,7),delta);
    if(month===null)result=delta<0?today:'2099-12-31';
    else result=month+'-'+String(Math.min(value.getUTCDate(),makeCalendarMonth(month,today).days.length)).padStart(2,'0');
  }else return null;
  return result<today?today:result>'2099-12-31'?'2099-12-31':result;
}
