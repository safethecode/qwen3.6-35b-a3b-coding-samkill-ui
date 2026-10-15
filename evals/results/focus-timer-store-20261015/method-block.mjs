import{parse}from'acorn';
export function methodBlock(raw,{name,params}){
if(typeof raw!=='string'||!raw.trim())throw Error('Empty method candidate');const text=raw.trim(),comments=[],options={ecmaVersion:'latest',sourceType:'module',onComment:comments};
if(text.startsWith('{')){const prefix=`function ${name}(${params.join(',')})`,ast=parse(prefix+text,options);if(comments.length||ast.body.length!==1||ast.body[0].body.end!==prefix.length+text.length)throw Error('Candidate contains extra code or comments');return{block:text,kind:'exact-block'}}
if(!/^(?:function|async|export|import)\b/.test(text)){const prefix=`function ${name}(${params.join(',')}){`,ast=parse(prefix+text+'}',options);if(comments.length||ast.body.length!==1||ast.body[0].body.end!==prefix.length+text.length+1)throw Error('Invalid statement slot');return{block:'{'+text+'}',kind:'host-wrapped-exact-statements'}}
const ast=parse(text,options),fn=ast.body[0];if(comments.length||ast.body.length!==1||fn.type!=='FunctionDeclaration'||fn.id?.name!==name||fn.async||fn.generator||fn.params.length!==params.length||fn.params.some((p,i)=>p.type!=='Identifier'||p.name!==params[i]))throw Error('Function signature or outer scope differs');return{block:text.slice(fn.body.start,fn.body.end),kind:'host-extracted-exact-function-body'};
}
