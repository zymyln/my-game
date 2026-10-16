export function setupAudioPanel({sound,onOpen,onClose,onChange}){
  const root=document.getElementById('audio-panel'),opener=document.getElementById('audio-settings');
  const shade=document.getElementById('audio-shade');
  let preview=null,focus=null,inertStates=[];
  const refresh=()=>{
    document.getElementById('audio-master').textContent=sound.unavailable?'当前浏览器不支持声音':sound.enabled?'声音已开启':'声音已关闭';
    document.getElementById('audio-master').disabled=Boolean(sound.unavailable);
    document.getElementById('audio-master').setAttribute('aria-pressed',String(sound.enabled));
    for(const input of root.querySelectorAll('input[data-channel]')){input.value=Math.round(sound.levels[input.dataset.channel]*100);input.nextElementSibling.textContent=`${input.value}%`;}
    for(const button of root.querySelectorAll('[data-listen]'))button.setAttribute('aria-pressed',String(button.dataset.listen===preview));
    document.getElementById('audio-preview-status').textContent=sound.unavailable?'可以继续游玩，声音暂不可用。':!sound.enabled?'声音已关闭，可以点上方按钮开启。':preview?'正在试听；关闭面板后恢复剧情配乐。':'选择一段音乐试听，或调整音量。';
    onChange();
  };
  function close(){root.hidden=true;shade.hidden=true;preview=null;for(const [element,value]of inertStates)element.inert=value;inertStates=[];opener.setAttribute('aria-expanded','false');onClose();focus?.focus({preventScroll:true});}
  opener.addEventListener('click',()=>{
    if(!root.hidden){close();return;}focus=document.activeElement;preview=null;onOpen();root.hidden=false;shade.hidden=false;
    inertStates=[...root.parentElement.children].filter(element=>element!==root&&element!==shade).map(element=>[element,element.inert]);
    for(const [element]of inertStates)element.inert=true;
    opener.setAttribute('aria-expanded','true');refresh();
    sound.activate().then(refresh).catch(()=>{});document.getElementById('audio-master').focus({preventScroll:true});
  });
  document.getElementById('audio-close').addEventListener('click',close);
  document.getElementById('pause-audio').addEventListener('click',()=>opener.click());
  shade.addEventListener('click',close);
  document.getElementById('audio-master').addEventListener('click',async()=>{try{await sound.toggle();}catch{}refresh();});
  for(const input of root.querySelectorAll('input[data-channel]'))input.addEventListener('input',()=>{sound.volume(input.dataset.channel,Number(input.value)/100);refresh();});
  for(const button of root.querySelectorAll('[data-listen]'))button.addEventListener('click',()=>{preview=button.dataset.listen;sound.activate().then(refresh).catch(()=>{});refresh();});
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
    if(event.key==='Tab'){
      const controls=[...root.querySelectorAll('button,input')],first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  return {get active(){return !root.hidden;},get profile(){return preview;}};
}
