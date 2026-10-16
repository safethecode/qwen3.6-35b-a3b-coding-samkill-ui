import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Qwen36 client advertises the same context and output limits as its Ollama profile',async()=>{
 const modelfile=await readFile(new URL('../profiles/Modelfile.qwen36',import.meta.url),'utf8'),config=JSON.parse(await readFile(new URL('../profiles/opencode-qwen36.json',import.meta.url))),modelId=config.model.slice('ollama/'.length),model=config.provider.ollama.models[modelId];
 const parameters=Object.fromEntries([...modelfile.matchAll(/^PARAMETER\s+(\w+)\s+(\S+)$/gm)].map(([,key,value])=>[key,Number(value)]));
 assert.ok(model);assert.equal(config.small_model,config.model);assert.equal(parameters.num_ctx,model.limit.context);assert.equal(parameters.num_predict,model.limit.output);assert.ok(parameters.num_ctx>=16384&&parameters.num_predict<parameters.num_ctx);
 assert.equal(config.provider.ollama.npm,'@ai-sdk/openai-compatible');assert.equal(config.provider.ollama.options.baseURL,'http://127.0.0.1:11434/v1');assert.ok(config.provider.ollama.options.timeout>=600000);assert.ok(config.provider.ollama.options.headerTimeout>=600000);
 assert.equal(model.tool_call,true);assert.equal(model.attachment,true);assert.deepEqual(model.modalities,{input:['text','image'],output:['text']});assert.equal(model.options.reasoningEffort,'none');assert.match(modelfile,/^FROM qwen3\.6:35b$/m);assert.doesNotMatch(modelfile,/^PARAMETER num_gpu/m);
 assert.equal(config.mcp,undefined);assert.equal(config.permission,undefined);assert.equal(config.plugin,undefined);
});
