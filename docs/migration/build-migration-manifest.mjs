// Run from the original repository. Read-only inventory; writes only this manifest.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const tracked=execFileSync('git',['ls-files','-z','--','games/loop-town/','content/planning/loop-town/','assets/style-references/lydia/'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const files=[];
function record(source,target){
 const bytes=readFileSync(path.join(root,source));
 files.push({source,target,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
for(const source of tracked){
 const target=source==='games/loop-town/README.md'?'docs/archive/开发环境-迁移前.md':source.replace(/^games\/loop-town\//,'');
 record(source,target);
}
record('docs/循环小镇-下一对话交接.md','docs/archive/迁移前交接.md');
for(const [source,target] of [
 ['AGENTS-新仓库草案.md','AGENTS.md'],
 ['README-新仓库草案.md','README.md'],
 ['交接-新仓库草案.md','docs/交接.md'],
 ['state-新仓库初始稿.md','docs/state.md'],
]) record(`docs/migration/${source}`,target);
files.sort((a,b)=>a.target.localeCompare(b.target,'zh-CN'));
const targets=new Set();
for(const f of files){
 if(targets.has(f.target)||f.target.startsWith('/')||f.target.split('/').includes('..'))throw Error(`Invalid/duplicate target ${f.target}`);
 targets.add(f.target);
}
const document={
 preparedOn:'2026-10-20',status:'preparation_only_not_migrated',
 sourceRepository:git('remote','get-url','origin'),sourceCommit:git('rev-parse','HEAD'),
 scope:'Tracked Loop Town files + explicit new-repository document drafts; no files copied or remote created.',
 fileCount:files.length,totalBytes:files.reduce((sum,f)=>sum+f.bytes,0),
 manuallyCreate:['.gitignore (new repository only, see migration checklist)'],
 pendingAssets:['Lydia image originals referenced in assets/style-references/lydia; not tracked in this repository and not included.'],
 requiredPostCopyEdits:['Adapt planning README old chapter references and old machine restrictions in the migration copy; see checklist.','Fill actual destination/remote and migration validation results in docs/state.md.'],
 files,
};
// Confirm local links in the proposed target tree, not against the old file locations.
let localLinks=0;
for(const f of files.filter(f=>f.target.endsWith('.md'))){
 const text=readFileSync(path.join(root,f.source),'utf8');
 for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
  const href=match[1].split('#')[0];if(!href||/^[a-z]+:/i.test(href))continue;
  const dest=path.posix.normalize(path.posix.join(path.posix.dirname(f.target),decodeURIComponent(href)));
  if(!targets.has(dest))throw Error(`Broken target-tree link ${f.target} -> ${href}`);
  localLinks++;
 }
}
document.targetTreeLocalLinksChecked=localLinks;
writeFileSync(new URL('migration-manifest.json',import.meta.url),JSON.stringify(document,null,2)+'\n');
console.log(`${files.length} files, ${document.totalBytes} bytes, ${localLinks} target-tree local links checked; no copy or upload performed.`);
