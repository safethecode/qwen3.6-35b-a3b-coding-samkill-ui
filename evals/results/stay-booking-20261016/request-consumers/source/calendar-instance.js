import {installDateCalendar} from './calendar-controller.js';
let calendar=null;
const id=value=>document.getElementById(value);
export function installCalendar(today){
  if(calendar)return;
  calendar=installDateCalendar({dialog:id('date-calendar'),today});
  for(const[opener,start,end,parent]of[['open-search-calendar','check-in','check-out','search-dialog'],['open-trip-calendar','room-check-in','room-check-out','trip-dialog']]){
    id(opener).addEventListener('click',()=>calendar.open({start:id(start).value,end:id(end).value},value=>{
      if(!id(parent).open)return;
      id(start).value=value.start;id(end).value=value.end;
      for(const field of[start,end])id(field).dispatchEvent(new Event('input',{bubbles:true}));
    },id(opener)));
  }
}
export function dismissCalendar(){
  const wasOpen=id('date-calendar').open;
  if(!wasOpen)return false;
  calendar?.dismiss();
  for(const parent of['search-dialog','trip-dialog'])if(id(parent).open)id(parent).close();
  return true;
}
