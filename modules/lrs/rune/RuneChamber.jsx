'use client';

import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {runeImage,runeName} from './rune-directory.mjs';
import {runeGlyphProfile} from './vfx/rune-glyph-library.mjs';

// Architectural vocabulary, not a second definition of Rune meanings.
// All 66 drawn cards plus the non-drawable Rune Zero share one bounded scene.
const ROOMS=Object.freeze({
  1:{name:'靈魂',wall:'#172033',floor:'#22283b',glow:'#bbabd9',form:'mirrors'},
  2:{name:'連結',wall:'#1c2831',floor:'#24343a',glow:'#9ad2bb',form:'rings'},
  3:{name:'生命',wall:'#322330',floor:'#372934',glow:'#efadbc',form:'arches'},
  4:{name:'自然',wall:'#1b3028',floor:'#27372b',glow:'#a1cf93',form:'leaves'},
  5:{name:'礦物',wall:'#292b30',floor:'#3a393a',glow:'#dac9a5',form:'crystals'},
  6:{name:'元素',wall:'#302b30',floor:'#43352c',glow:'#f6b47d',form:'elements'},
  7:{name:'秩序',wall:'#1e2937',floor:'#303b48',glow:'#b7d0f2',form:'columns'},
  8:{name:'無序',wall:'#25213a',floor:'#332b48',glow:'#c4a2ef',form:'fractals'},
  9:{name:'系統',wall:'#23212c',floor:'#363039',glow:'#e2c6de',form:'thresholds'}
});

export default function RuneChamber({rune,groupId}){
  const canvasRef=useRef(null);
  const [unavailable,setUnavailable]=useState(false);
  const src=runeImage(rune);
  const title=runeName(rune);
  const profile=runeGlyphProfile(rune);
  const room=ROOMS[groupId]||ROOMS[9];
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas||!src)return;
    let live=true,renderer,observer,resizeFallback;
    const geometries=[],materials=[],textures=[];
    let scene,camera;
    let yaw=0,drag=null;
    const geometry=g=>(geometries.push(g),g);
    const material=m=>(materials.push(m),m);
    const mat=(color,metalness=0.12,roughness=0.7)=>material(new THREE.MeshStandardMaterial({color,metalness,roughness}));
    const add=(shape,paint,x=0,y=0,z=0,rotation=0)=>{
      const mesh=new THREE.Mesh(geometry(shape),paint);
      mesh.position.set(x,y,z);
      mesh.rotation.z=rotation;
      scene.add(mesh);
      return mesh;
    };
    const box=(w,h,d,color,x,y,z,metal=.1)=>add(new THREE.BoxGeometry(w,h,d),mat(color,metal),x,y,z);
    const render=()=>{
      if(!live||!renderer||!scene||!camera)return;
      camera.position.set(Math.sin(yaw)*7.2,2.55,Math.cos(yaw)*7.2);
      camera.lookAt(0,1.85,-.7);
      renderer.render(scene,camera);
    };
    const pointerDown=e=>{drag={id:e.pointerId,x:e.clientX,yaw};canvas.setPointerCapture?.(e.pointerId);};
    const pointerMove=e=>{if(!drag||drag.id!==e.pointerId)return;yaw=THREE.MathUtils.clamp(drag.yaw+(e.clientX-drag.x)*.004,-.46,.46);render();};
    const pointerUp=e=>{if(drag?.id===e.pointerId)drag=null;};
    const lost=e=>{e.preventDefault();setUnavailable(true);};
    canvas.addEventListener('pointerdown',pointerDown);
    canvas.addEventListener('pointermove',pointerMove);
    canvas.addEventListener('pointerup',pointerUp);
    canvas.addEventListener('pointercancel',pointerUp);
    canvas.addEventListener('webglcontextlost',lost);
    try{
      renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.1;
      renderer.setClearColor(room.wall);
      scene=new THREE.Scene();
      scene.background=new THREE.Color(room.wall);
      camera=new THREE.PerspectiveCamera(38,1,.1,50);
      scene.add(new THREE.HemisphereLight(0xf5f2ff,room.floor,2.15));
      const key=new THREE.SpotLight(0xffffff,60,18,Math.PI/5,.4);
      key.position.set(-1,6,5);key.target.position.set(0,1.8,-.8);
      scene.add(key,key.target);
      const accent=new THREE.PointLight(room.glow,35,11);
      accent.position.set(2.9,3.3,.6);scene.add(accent);
      box(12,.17,11,room.floor,0,-.08,0,.18);
      box(12,6,.16,room.wall,0,3,-2.75);
      box(.15,6,8,room.wall,-5.1,3,.2);
      box(.15,6,8,room.wall,5.1,3,.2);
      box(10,.16,.2,room.glow,0,5.55,-2.65,.4);
      box(4.3,.65,2.3,room.floor,0,.32,-.8,.35);
      box(3.05,.12,.7,room.glow,0,.69,-.8,.45);
      const ink=profile.ink||room.glow;
      const accentMat=mat(ink,.58,.28),mutedMat=mat(room.glow,.45,.4);
      // Bounded room decoration: roughly two dozen simple geometries, no FPS loop.
      for(const side of [-1,1]){
        box(.14,4.65,.25,room.glow,side*3.75,2.5,-2.52,.5);
        box(1.3,.11,.2,ink,side*3.75,4.82,-2.47,.5);
        if(room.form==='mirrors'){
          add(new THREE.PlaneGeometry(1.2,2.75),material(new THREE.MeshPhysicalMaterial({color:ink,metalness:.5,roughness:.12,side:THREE.DoubleSide,transparent:true,opacity:.38})),side*3.3,2.55,-2.32,side*.06);
        } else if(room.form==='rings'||room.form==='thresholds'){
          add(new THREE.TorusGeometry(.9,.065,8,40),accentMat,side*3.35,2.6,-1.95,side*.18);
          if(room.form==='thresholds')add(new THREE.TorusGeometry(.57,.04,8,36),mutedMat,side*3.35,2.6,-1.92);
        } else if(room.form==='arches'||room.form==='columns'){
          box(.35,3.2,.35,room.glow,side*3.45,2,-1.8,.38);
          add(new THREE.SphereGeometry(.36,12,8),accentMat,side*3.45,3.85,-1.8);
        } else if(room.form==='leaves'){
          box(.18,2.4,.18,room.glow,side*3.45,1.48,-1.85);
          add(new THREE.ConeGeometry(.85,1.6,7),accentMat,side*3.45,3.1,-1.85,side*.14);
        } else if(room.form==='crystals'){
          add(new THREE.OctahedronGeometry(1.06,0),accentMat,side*3.3,1.75,-1.65,side*.23);
          add(new THREE.OctahedronGeometry(.48,0),mutedMat,side*2.95,3.2,-2.0);
        } else if(room.form==='elements'){
          add(new THREE.IcosahedronGeometry(.83,1),accentMat,side*3.35,2.6,-1.82);
          add(new THREE.TorusGeometry(1.15,.035,6,42),mutedMat,side*3.35,2.6,-1.84,side*.28);
        } else if(room.form==='fractals'){
          add(new THREE.IcosahedronGeometry(.8,0),accentMat,side*3.2,2.65,-1.75,side*.27);
          add(new THREE.OctahedronGeometry(.45,0),mutedMat,side*3.8,3.8,-1.5,side*.19);
        }
      }
      // The original numbered card is the only image texture in the room.
      box(2.58,3.58,.18,room.floor,0,2.56,-1.3,.5);
      box(2.42,3.42,.2,room.glow,0,2.56,-1.18,.3);
      const cardMat=material(new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
      const card=add(new THREE.PlaneGeometry(2.26,3.22),cardMat,0,2.56,-1.04);
      const resize=()=>{
        if(!live||!renderer||!camera)return;
        const w=canvas.clientWidth,h=canvas.clientHeight;
        if(w<16||h<16)return;
        renderer.setSize(w,h,false);
        camera.aspect=w/h;
        camera.updateProjectionMatrix();
        render();
      };
      if(typeof ResizeObserver!=='undefined'){
        observer=new ResizeObserver(resize);
        observer.observe(canvas);
      }else{resizeFallback=resize;window.addEventListener('resize',resizeFallback);}
      resize();
      const loader=new THREE.TextureLoader();
      loader.load(src,t=>{
        if(!live){t.dispose();return;}
        t.colorSpace=THREE.SRGBColorSpace;
        textures.push(t);cardMat.map=t;cardMat.needsUpdate=true;render();
      },undefined,()=>{if(live)setUnavailable(true);});
    }catch{
      if(live)setUnavailable(true);
    }
    return()=>{
      live=false;
      observer?.disconnect();if(resizeFallback)window.removeEventListener('resize',resizeFallback);
      canvas.removeEventListener('pointerdown',pointerDown);
      canvas.removeEventListener('pointermove',pointerMove);
      canvas.removeEventListener('pointerup',pointerUp);
      canvas.removeEventListener('pointercancel',pointerUp);
      canvas.removeEventListener('webglcontextlost',lost);
      textures.forEach(x=>x.dispose());geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());
      renderer?.dispose();renderer?.forceContextLoss();
    };
  },[src,groupId,profile.ink,room]);
  return <div className="rune-chamber" data-rune-room={Number(rune.rune_id)} data-group-room={groupId}>
    <canvas ref={canvasRef} className="rune-chamber-canvas" aria-hidden="true"/>
    {unavailable?<div className="rune-chamber-fallback" role="status">
      <img src={src} alt={title+'原創符文卡面'}/><span>此裝置無法展示 3D 房間，改以原創卡圖呈現。</span>
    </div>:null}
    <div className="rune-chamber-label"><span>RUNE ROOM · {String(Number(rune.rune_id)).padStart(2,'0')}</span><strong>{title} · {room.name}展室</strong>
      <small>左右拖曳可稍微調整視角；完整符文說明位於下方。</small>
    </div>
  </div>;
}
