import {useMemo} from 'react';
import heroBlocks from '../../../app/modular/published-blocks/lrunes/hero.js';
import {HomeBlock} from '../../../app/loc/blocks/home-block-model.js';
import {parseBlockImage} from '../../../app/loc/blocks/hero-image.mjs';
import {runeAssetUrl} from '../../../modules/lrs/rune/asset-url.mjs';

// Preserve LOC's original public hero block and class/slot layout.
// This file is a read-only Web renderer; it is not an editing authorization
// substitute for LOC's ScopeEditableBlocks and cannot issue a grant.
function normalizeRow(row){
  return {
    uid:String(row.uid||''),stored:Boolean(row.uid),order:Number(row.block_order)||1,
    eyebrow:String(row.block_eyebrow||''),title:String(row.block_title||''),
    subtitle:String(row.block_subtitle||''),
    text:HomeBlock.removeDuplicatedLegacySubtitle(row.block_text,row.block_subtitle),
    image:parseBlockImage(row.block_image),
    bubbleColumns:HomeBlock.bubbleColumns(row.block_entity,'hero'),
    entities:HomeBlock.normalizeEntities(row.block_entity)
  };
}
const publishedSlots=Object.freeze(heroBlocks.map(normalizeRow).sort((a,b)=>a.order-b.order));
export function resolveHomeImage(slot){
  const raw=String(slot?.image?.url||'').trim();
  // The original artwork is now served directly by LRS, not re-packed
  // into the LOC Web release.
  const src=raw==='https://loc.lo3rwang.cc/pics/LunaRunes-hero.jpg'||raw==='/pics/LunaRunes-hero.jpg'
    ?runeAssetUrl('pics/LunaRunes-hero.jpg'):raw;
  return {src,mode:slot?.image?.mode==='side'?'side':'background',
    position:slot?.image?.position||'right',width:slot?.image?.width||420};
}
export function locHomeBlockClass(slot){
  const image=resolveHomeImage(slot);
  return 'loc-card loc-home-block'+(image.src?' loc-home-block--with-image':'');
}
export function homeBlockMediaStyle(slot){
  const image=resolveHomeImage(slot);
  return image.src?{'--loc-home-media-max':image.width+'px'}:undefined;
}
export function RunesHomeBlockDisplay(slot){
  const image=resolveHomeImage(slot);
  return <>
    <header className="loc-home-block__header">
      {slot.eyebrow?<p className="loc-eyebrow">{slot.eyebrow}</p>:null}
      {slot.title?<h2>{slot.title}</h2>:null}
      {slot.subtitle?<p className="loc-subtitle loc-home-block__subtitle">{HomeBlock.plainBlockLine(slot.subtitle)}</p>:null}
    </header>
    {slot.text?<div className="loc-home-block__body scope-rich-surface"
      dangerouslySetInnerHTML={{__html:HomeBlock.stripLocHomeEditorPlaceholders(slot.text)}}/>:null}
    {image.src?<img className="loc-home-block__media" src={image.src} alt="" loading="lazy"/>:null}
  </>;
}
export default function ScopeEditableBlocks({
  scopeId,page='hero',maxBlocks,placeholderFirstOrder,
  renderDisplay,resolveSlotClassName,resolveSlotStyle,toggleExtra,containerless,
  slotClassName='loc-card',className=''
}){
  // Source-of-truth live published-block reads remain a migration gate.
  // Do not silently present a snapshot as the current database state.
  if(scopeId!=='lrunes'||page!=='hero')throw new Error('LRS only implements its original public Rune Hero');
  const slots=useMemo(()=>publishedSlots.filter(slot=>!maxBlocks||slot.order<=maxBlocks),[maxBlocks]);
  const contents=<>
    {slots.map(slot=><section key={slot.uid||slot.order}
      className={(resolveSlotClassName?.(slot)||slotClassName)+' scope-editable-block'}
      style={resolveSlotStyle?.(slot)} data-page-name={page} data-block-order={slot.order}>
      {renderDisplay?.(slot)||RunesHomeBlockDisplay(slot)}
    </section>)}
    {slots.length===0&&placeholderFirstOrder?<section className="scope-status" role="status">符文首頁 Hero 尚未發布。</section>:null}
    {toggleExtra?<div className="scope-edit-mode-toggle">{toggleExtra}</div>:null}
  </>;
  return containerless?contents:<div className={'scope-editable-block-grid '+className}>{contents}</div>;
}
