import {isBookableRange,countNights} from './dates.js';
import {shiftCalendarMonth,chooseCalendarDate} from './calendar-model.js';
import {renderCalendarMonths} from './calendar-renderer.js';
import {resolveCalendarFocus} from './calendar-focus.js';
export function installDateCalendar({dialog,today}){
  const get=id=>dialog.querySelector('#'+id),months=get('calendar-months'),previous=get('calendar-previous'),next=get('calendar-next'),apply=get('calendar-apply');
  let draft={start:'',end:'',error:''},month=today.slice(0,7),focusDate='',callback=null,opener=null;
  const clear=()=>{draft={start:'',end:'',error:''};callback=null;opener=null;focusDate='';month=today.slice(0,7);};
  const restore=node=>{if(node?.isConnected&&node.getClientRects().length&&!node.disabled)node.focus();};
  function render(){
    renderCalendarMonths(months,{month,today,draft,focusDate});
    previous.disabled=month<=today.slice(0,7);next.disabled=month>='2099-12';apply.disabled=Boolean(draft.error)||!isBookableRange(draft.start,draft.end,today);
    const format=date=>date.split('-').map(Number).join('.');
    get('calendar-selection').textContent=!draft.start?'체크인 날짜를 선택해 주세요':!draft.end?'체크아웃 날짜를 선택해 주세요':`${format(draft.start)} ~ ${format(draft.end)} · ${countNights(draft.start,draft.end)}박`;
    get('calendar-error').textContent=draft.error;
    const active=months.querySelector('button[data-date][tabindex="0"]');if(active){focusDate=active.dataset.date;active.focus();}
  }
  function dismiss(){clear();if(dialog.open)dialog.close();}
  function cancel(){const saved=opener;dismiss();restore(saved);}
  function open(value,onApply,currentOpener){
    if(dialog.open)dismiss();
    const valid=isBookableRange(value?.start,value?.end,today);draft={start:valid?value.start:'',end:valid?value.end:'',error:''};
    month=valid?draft.start.slice(0,7):today.slice(0,7);focusDate=valid?draft.start:today;callback=onApply;opener=currentOpener;
    dialog.showModal();render();
  }
  get('calendar-cancel').addEventListener('click',cancel);
  dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
  dialog.addEventListener('close',()=>{if(!dialog.open)clear();});
  apply.addEventListener('click',()=>{
    if(!dialog.open||apply.disabled||!isBookableRange(draft.start,draft.end,today)||draft.error||typeof callback!=='function')return;
    const savedCallback=callback,savedOpener=opener,value={start:draft.start,end:draft.end};dismiss();savedCallback(value);restore(savedOpener);
  });
  for(const[button,delta]of[[previous,-1],[next,1]])button.addEventListener('click',()=>{
    if(button.disabled||!dialog.open)return;const shifted=shiftCalendarMonth(month,delta);if(!shifted||shifted<today.slice(0,7))return;
    month=shifted;focusDate='';render();
  });
  months.addEventListener('click',event=>{
    const button=event.target.closest('button[data-date]');if(!dialog.open||!button||button.disabled||!months.contains(button))return;
    draft=chooseCalendarDate(draft,button.dataset.date,today);focusDate=button.dataset.date;render();
  });
  months.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    const button=event.target.closest('button[data-date]');if(!dialog.open||!button||button.disabled)return;
    const target=resolveCalendarFocus(button.dataset.date,event.key,event.shiftKey,today);if(target===null)return;event.preventDefault();focusDate=target;
    if(!months.querySelector(`button[data-date="${target}"]`))month=target.slice(0,7);render();
  });
  return{open,dismiss};
}
