export async function inspectTextGap(page,rule){
  if(!rule||!['subject','groups','text'].every(key=>typeof rule[key]==='string'&&rule[key].trim())||!['inline','block'].includes(rule.axis)||!Number.isFinite(rule.minimum)||rule.minimum<0)throw new Error('Text gap requires subject/groups/text selectors,inline or block axis and a nonnegative CSS-px minimum');
  const observed=await page.locator(rule.subject).evaluate((root,rule)=>{
    const groups=[...root.querySelectorAll(rule.groups)],pairs=[],seen=new Set();let owners=0;
    const result={axis:rule.axis,requiredMinimum:rule.minimum,tolerancePx:.05,groupCount:groups.length,ownerCount:0,pairCount:0,pairs};
    if(!groups.length||groups.length>128)return{...result,unsupported:'Expected1–128 actual text groups'};
    for(const[groupIndex,group]of groups.entries()){
      if(getComputedStyle(group).writingMode!=='horizontal-tb')return{...result,unsupported:'Vertical writing needs a separate text-gap measurement'};
      const elements=[...group.querySelectorAll(rule.text)];
      if(!elements.length||elements.length>128)return{...result,unsupported:'Each group requires1–128 concrete text owners'};
      const boxes=[];
      for(const element of elements){
        if(seen.has(element))return{...result,unsupported:'Text groups overlap ownership'};seen.add(element);owners++;
        if(owners>512)return{...result,unsupported:'Text owner limit exceeded'};
        if(element.childElementCount||!element.textContent.trim())return{...result,unsupported:'Select nonempty plain text owners rather than mixed-content containers'};
        if(!element.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))return{...result,unsupported:'Declared text owner is not rendered'};
        if(getComputedStyle(element).writingMode!=='horizontal-tb')return{...result,unsupported:'Vertical text needs separate rendered review'};
        for(let ancestor=element;ancestor;ancestor=ancestor.parentElement){
          const style=getComputedStyle(ancestor);
          if(style.transform!=='none'||['translate','rotate','scale'].some(key=>style[key]&&style[key]!=='none')||style.zoom&&!['1','normal'].includes(style.zoom))return{...result,unsupported:'Transformed text needs separate rendered review'};
          if(['::before','::after'].some(pseudo=>!['none','normal'].includes(getComputedStyle(ancestor,pseudo).content)))return{...result,unsupported:'Generated content needs separate rendered review'};
        }
        const range=document.createRange();range.selectNodeContents(element);const rects=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0);
        if(rects.length!==1)return{...result,unsupported:'Wrapped or fragmented text needs separate line ownership'};
        const r=rects[0];boxes.push({text:element.textContent.slice(0,80),x:r.x,y:r.y,right:r.right,bottom:r.bottom});
      }
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
        let a=boxes[i],b=boxes[j];
        const cross=rule.axis==='inline'?Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y):Math.min(a.right,b.right)-Math.max(a.x,b.x);
        if(cross<=.05)continue;
        if(rule.axis==='inline'?a.x>b.x:a.y>b.y)[a,b]=[b,a];
        const gap=rule.axis==='inline'?b.x-a.right:b.y-a.bottom;
        pairs.push({groupIndex,from:a.text,to:b.text,gap});
        if(pairs.length>16384)return{...result,unsupported:'Text pair limit exceeded'};
      }
    }
    return{...result,ownerCount:owners,pairCount:pairs.length,minimumMeasuredGap:pairs.length?Math.min(...pairs.map(pair=>pair.gap)):null};
  },rule);
  if(observed.unsupported)return{status:'UNVERIFIED',detail:observed.unsupported,observed};
  if(!observed.pairCount)return{status:'UNVERIFIED',detail:'No text pairs share a cross-axis band',observed};
  if(observed.minimumMeasuredGap+.05<rule.minimum)return{status:'FAIL',detail:`Rendered text gap ${observed.minimumMeasuredGap.toFixed(3)}px is below declared ${rule.minimum}px`,observed};
  return{status:'PASS',observed,scope:'Actual plain single-line text range separation,including offscreen layout. Does not approve clipping,reachability,font identity,ink appearance or reference quality.'};
}
