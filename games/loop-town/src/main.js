import {DEMO} from './data/demo.js';

const shell=document.getElementById('game-shell'),panel=document.getElementById('dialogue');
const hint=document.getElementById('interaction'),status=document.getElementById('engine-status');
if(!globalThis.Phaser){document.getElementById('error').hidden=false;throw new Error('Phaser was not loaded; install the locked project dependencies first.');}

class TownScene extends Phaser.Scene {
  constructor(){super('Town');}
  create(){
    this.physics.world.setBounds(16,170,DEMO.width-32,DEMO.height-186);
    this.drawMap();this.makePlayerTexture();
    this.player=this.physics.add.sprite(DEMO.start.x,DEMO.start.y,'traveler').setOrigin(.5,1).setDepth(DEMO.start.y);
    this.player.body.setSize(10,6).setOffset(3,18);this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player,this.obstacles);
    this.cameras.main.setBounds(0,0,DEMO.width,DEMO.height).startFollow(this.player,true,.12,.12);
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys('W,A,S,D,E,ESC');
    this.keys.E.on('down',()=>this.interact());this.keys.ESC.on('down',()=>this.closeDialogue());
    document.getElementById('close-dialogue').onclick=()=>this.closeDialogue();
    this.game.events.on(Phaser.Core.Events.BLUR,()=>{this.input.keyboard.resetKeys();this.player.setVelocity(0);});
    status.textContent='环境就绪 · 可以行走';shell.dataset.ready='true';shell.focus({preventScroll:true});
  }
  drawMap(){
    const g=this.add.graphics(),r=(color,x,y,w,h)=>g.fillStyle(color).fillRect(x,y,w,h);
    r(0x95ac7f,0,0,640,480);
    for(let y=0;y<480;y+=20)for(let x=0;x<640;x+=20){
      r((x+y)%60===0?0xa3b98b:0x9bb184,x+2,y+3,13,2);
      if((x*7+y)%100===0){r(0x77966b,x+7,y+12,2,4);r(0xe6d5a3,x+6,y+10,4,2);}
    }
    r(0xbfb99a,285,120,70,360);r(0xc9c3a4,192,190,248,188);
    for(let y=198;y<370;y+=24)for(let x=200+(y%3)*4;x<430;x+=32){r(0xd6cfb1,x,y,27,19);r(0xaaa98d,x,y+19,27,2);r(0xe4dcc1,x+2,y+2,22,1);}
    this.obstacles=this.physics.add.staticGroup();
    for(const house of DEMO.buildings){
      const {x,y,w,h}=house;r(0x6f795d,x-4,y+h-4,w+8,10);r(0xe1d3b0,x,y,w,h);
      r(0xbaaa85,x+6,y+20,w-12,h-20);r(0x80694e,x+9,y,6,h);r(0x80694e,x+w-15,y,6,h);
      g.fillStyle(0x77717a).fillTriangle(x-12,y+17,x+w/2,y-33,x+w+12,y+17);
      r(0xaca0a0,x-9,y+17,w+18,5);r(0x665b4b,x+w/2-12,y+h-34,24,34);
      for(const wx of [x+23,x+w-45]){r(0x6e7f73,wx,y+39,24,27);r(0xc4d4b6,wx+3,y+42,18,21);r(0xf3e6c2,wx+11,y+42,2,21);}
      this.addBlock(x,y,w,h);
    }
    for(const {x,y}of DEMO.trees){
      r(0x6c805e,x-16,y-2,33,6);r(0x79684b,x-4,y-32,8,34);
      r(0x507251,x-25,y-48,50,25);r(0x648b5d,x-21,y-65,42,27);r(0x7da16b,x-14,y-72,28,20);
      r(0x94b37c,x-10,y-68,15,5);this.addBlock(x-7,y-9,14,12);
    }
    // A small well is a visible collision check near the center of the square.
    r(0x8b927a,239,243,38,18);r(0xb7b7a0,239,238,38,17);r(0x6c827d,244,237,28,10);
    r(0xe1d7b5,241,235,34,3);this.addBlock(239,238,38,20);
    const {x,y}=DEMO.notice;
    r(0x79664b,x-14,y-30,29,21);r(0xb59a6e,x-12,y-28,25,17);
    r(0xf1e5c4,x-8,y-25,17,11);r(0xb6aa87,x-5,y-22,11,1);r(0xb6aa87,x-5,y-19,8,1);
    r(0x78694d,x-9,y-9,3,14);r(0x78694d,x+7,y-9,3,14);this.addBlock(x-13,y-6,27,9);
    this.noticeMarker=this.add.text(x,y-45,'◆',{fontFamily:'serif',fontSize:'10px',color:'#fff0b9'}).setOrigin(.5).setDepth(500);
  }
  addBlock(x,y,w,h){const zone=this.add.zone(x+w/2,y+h/2,w,h);this.physics.add.existing(zone,true);this.obstacles.add(zone);}
  makePlayerTexture(){
    const g=this.make.graphics({x:0,y:0,add:false}),r=(c,x,y,w,h)=>g.fillStyle(c).fillRect(x,y,w,h);
    r(0x637f6355,1,21,14,3);r(0x333640,4,18,3,5);r(0x333640,9,18,3,5);
    r(0x486b7b,3,11,10,9);r(0xe9dfc6,1,12,3,6);r(0xd9cba9,12,12,3,6);
    r(0xe4c6a4,4,4,8,8);r(0x514b4b,3,2,10,5);r(0x71665b,5,1,6,3);
    r(0x384345,5,8,1,1);r(0x384345,10,8,1,1);r(0xbda78b,7,11,2,1);
    g.generateTexture('traveler',16,24);g.destroy();
  }
  interact(){if(!panel.hidden){this.closeDialogue();return;}if(!this.nearNotice)return;
    this.player.setVelocity(0);document.getElementById('dialogue-title').textContent=DEMO.notice.title;
    document.getElementById('dialogue-text').textContent=DEMO.notice.text;panel.hidden=false;hint.hidden=true;
    document.getElementById('close-dialogue').focus({preventScroll:true});
  }
  closeDialogue(){panel.hidden=true;shell.focus({preventScroll:true});}
  update(time){
    if(!this.player)return;
    const open=!panel.hidden;
    let dx=Number(this.cursors.right.isDown||this.keys.D.isDown)-Number(this.cursors.left.isDown||this.keys.A.isDown);
    let dy=Number(this.cursors.down.isDown||this.keys.S.isDown)-Number(this.cursors.up.isDown||this.keys.W.isDown);
    if(open){dx=0;dy=0;}
    const length=Math.hypot(dx,dy)||1;this.player.setVelocity(dx/length*85,dy/length*85);
    this.player.setDepth(this.player.y);this.player.setFlipX(dx<0);
    this.player.setAlpha((dx||dy) ? .94+Math.sin(time/95)*.06 : 1);
    this.nearNotice=Phaser.Math.Distance.Between(this.player.x,this.player.y,DEMO.notice.x,DEMO.notice.y)<DEMO.notice.radius;
    hint.hidden=open||!this.nearNotice;this.noticeMarker.setAlpha(this.nearNotice?1:.55);
    shell.dataset.playerX=this.player.x.toFixed(1);shell.dataset.playerY=this.player.y.toFixed(1);shell.dataset.dialogue=open?'open':'closed';
  }
}

new Phaser.Game({type:Phaser.AUTO,parent:'game-canvas',width:480,height:300,backgroundColor:'#95ac7f',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},scene:TownScene});
