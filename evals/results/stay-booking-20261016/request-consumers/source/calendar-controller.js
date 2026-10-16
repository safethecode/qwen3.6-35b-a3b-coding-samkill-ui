import {isBookableRange,countNights} from './dates.js';
import {shiftCalendarMonth,chooseCalendarDate} from './calendar-model.js';
import {renderCalendarMonths} from './calendar-renderer.js';
import {resolveCalendarFocus} from './calendar-focus.js';
export function installDateCalendar({dialog,today}){
  const get=id=>dialog.querySelector('#'+id),months=get('calendar-months'),previous=get('calendar-previous'),next=get('calendar-next'),apply=get('calendar-apply');
  let draft={start:'',end:'',error:''},month=today.slice(0,7),focusDate='',callback=null,opener=null;
  const clear=()=>{draft={start:'',end:'',error:''};callback=null;opener=null;focusDate='';month=today.slice(0,7);};
  const restore=node=>{if(node?.isConnected&&node.getClientRects().length&&!node.disabled)node.focus();};
  function revealDate(button){
    const owner=dialog.querySelector('[role=region][tabindex="0"]'),caption=button.closest('table')?.caption;
    if(owner&&caption){const top=owner.getBoundingClientRect().top+parseFloat(getComputedStyle(dialog).getPropertyValue('--calendar-weekday-height')),offset=caption.getBoundingClientRect().top-top;if(offset>.5)owner.scrollTop+=offset;}
    button.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  function updateScrollOwnership(){
    if(!dialog.open)return;
    const header=dialog.querySelector('.calendar-header'),controls=dialog.querySelector('.calendar-controls'),footer=dialog.querySelector('.calendar-footer'),weekdays=dialog.querySelector('.calendar-weekdays'),caption=months.querySelector('caption'),day=months.querySelector('button[data-date]');
    if(!header||!controls||!footer||!weekdays||!caption||!day)return;
    const maximum=Math.min(innerHeight-16,parseFloat(getComputedStyle(dialog).maxHeight)||innerHeight-16),available=maximum-header.getBoundingClientRect().height-controls.getBoundingClientRect().height-footer.getBoundingClientRect().height;
    const week=weekdays.getBoundingClientRect().height+(parseFloat(getComputedStyle(weekdays).marginBottom)||0),context=week+caption.getBoundingClientRect().height;
    for(const[name,value]of[['--calendar-weekday-height',week],['--calendar-context-height',context]])if(dialog.style.getPropertyValue(name)!==value+'px')dialog.style.setProperty(name,value+'px');
    const minimum=context+day.getBoundingClientRect().height;
    const mode=available<minimum?'flow':'fixed';if(dialog.dataset.scrollMode!==mode){const previous=dialog.querySelector('[role=region][tabindex="0"]'),active=document.activeElement;dialog.dataset.scrollMode=mode;const body=dialog.querySelector('.calendar-body'),viewport=dialog.querySelector('.calendar-viewport'),owner=mode==='flow'?body:viewport;for(const node of[body,viewport])if(node){node.tabIndex=node===owner?0:-1;if(node===owner){node.setAttribute('role','region');node.setAttribute('aria-label','날짜 선택 달력');}else{node.removeAttribute('role');node.removeAttribute('aria-label');}}if(active===previous&&owner)owner.focus({preventScroll:true});if(months.contains(active))requestAnimationFrame(()=>{if(dialog.open&&active.isConnected)revealDate(active);});}
  }
  const observer=new ResizeObserver(updateScrollOwnership);for(const node of[dialog,dialog.querySelector('.calendar-header'),dialog.querySelector('.calendar-footer')])observer.observe(node);
  window.addEventListener('resize',updateScrollOwnership);
  function render(){
    renderCalendarMonths(months,{month,today,draft,focusDate});
    previous.disabled=month<=today.slice(0,7);next.disabled=month>='2099-12';apply.disabled=Boolean(draft.error)||!isBookableRange(draft.start,draft.end,today);
    const format=date=>date.split('-').map(Number).join('.');
    get('calendar-selection').textContent=!draft.start?'체크인 날짜를 선택해 주세요':!draft.end?'체크아웃 날짜를 선택해 주세요':`${format(draft.start)} ~ ${format(draft.end)} · ${countNights(draft.start,draft.end)}박`;
    get('calendar-error').textContent=draft.error;
    updateScrollOwnership();dialog.scrollTop=0;
    const active=months.querySelector('button[data-date][tabindex="0"]');if(active){focusDate=active.dataset.date;active.focus();revealDate(active);}
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
  months.addEventListener('focusin',event=>{const button=event.target.closest('button[data-date]');if(button&&!button.disabled){focusDate=button.dataset.date;button.scrollIntoView({block:'nearest',inline:'nearest'});}});
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
