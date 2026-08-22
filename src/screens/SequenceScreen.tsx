import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import Mascot from '../components/Mascot';
import { OPT_STYLES } from '../lib/styles';
import { makeSequenceQuestion, type SequenceQuestion } from '../lib/sequence';
import { playCorrect, playWrong } from '../lib/sounds';
import type { Screen, SequenceKind } from '../types';

interface Props { kind?: SequenceKind; recordAnswer: (t:number,c:boolean)=>void; recordSequence: (k:SequenceKind,c:boolean)=>void; go:(s:Screen)=>void; }

export default function SequenceScreen({ kind, recordAnswer, recordSequence, go }: Props) {
  const [cur, setCur] = useState<SequenceKind|null>(kind ?? null);
  const [q, setQ] = useState<SequenceQuestion|null>(null);
  const [fb, setFb] = useState<'ask'|'ok'|'bad'>('ask');
  const [picked, setPicked] = useState<number|null>(null);
  const [burst, setBurst]=useState(0);
  const timer=useRef<number|undefined>(undefined);
  useEffect(()=>()=>window.clearTimeout(timer.current),[]);

  const start=(k:SequenceKind)=>{ setCur(k); const qq=makeSequenceQuestion(k); setQ(qq); setFb('ask'); setPicked(null); };
  useEffect(()=>{ if(kind && !cur) start(kind); },[kind]);

  const answer=(opt:number)=>{
    if(fb!=='ask'||!q||!cur) return;
    const ok=opt===q.answer;
    recordAnswer(2,ok); recordSequence(cur, ok);
    if(ok){ playCorrect(); setBurst(b=>b+1);} else playWrong();
    setPicked(opt); setFb(ok?'ok':'bad');
    timer.current=window.setTimeout(()=>{ setQ(makeSequenceQuestion(cur,q)); setFb('ask'); setPicked(null); }, ok?700:1100);
  };

  if(!cur || !q){
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8">
        <button type="button" onClick={()=>go({name:'home'})} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"><ArrowLeft size={24} strokeWidth={2.8}/></button>
        <h1 className="mt-4 font-display text-2xl font-bold">🔢 Последовательность</h1>
        <p className="mt-1 text-sm font-extrabold text-[#8d84a3]">Продолжи ряд или найди лишнее</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {([{id:'next',label:'Следующее',emoji:'➡️',desc:'2, 4, 6, ?'}, {id:'odd',label:'Лишнее',emoji:'🚫',desc:'3, 6, 7, 9'}] as const).map(o=>(
            <button key={o.id} type="button" onClick={()=>start(o.id as SequenceKind)} className="flex flex-col items-center gap-1 rounded-3xl bg-white px-3 py-5 text-center font-extrabold shadow-[0_6px_0_#f0e7d6] active:translate-y-1">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-grape-soft text-lg">{o.emoji}</span>
              <span className="text-sm">{o.label}</span>
              <span className="text-xs text-[#8d84a3]">{o.desc}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button type="button" onClick={()=>start('gap' as SequenceKind)} className="flex flex-col items-center gap-1 rounded-3xl bg-white px-3 py-5 text-center font-extrabold shadow-[0_6px_0_#f0e7d6] active:translate-y-1">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-grape-soft text-lg">❓</span>
            <span className="text-sm">Пропущенное</span>
            <span className="text-xs text-[#8d84a3]">2, 4, ?, 8</span>
          </button>
          <button type="button" onClick={()=>start('mix' as SequenceKind)} className="flex flex-col items-center gap-1 rounded-3xl bg-white px-3 py-5 text-center font-extrabold shadow-[0_6px_0_#f0e7d6] active:translate-y-1">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sun-soft text-lg">🔀</span>
            <span className="text-sm">Вперемешку</span>
            <span className="text-xs text-[#8d84a3]">все виды</span>
          </button>
        </div>
      </main>
    );
  }
  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={()=>{ setCur(null); setQ(null); }} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"><ArrowLeft size={24} strokeWidth={2.8}/></button>
        <h1 className="flex-1 text-center font-display text-base font-bold">{cur==='next' ? '➡️ Следующее' : '🚫 Лишнее'}</h1>
        <button type="button" onClick={()=>go({name:'home'})} className="rounded-full bg-white px-3 py-2 text-xs font-extrabold shadow-[0_3px_0_#ece3d2]">🏠</button>
      </div>
      <div className="relative mt-5 rounded-blob bg-white p-7 text-center shadow-[0_6px_0_#f0e7d6]">
        <div className="text-xs font-extrabold tracking-widest text-[#8d84a3]">{q.hint ?? (cur==='next' ? 'Какое следующее?' : 'Какое не подходит?')}</div>
        <div className="mt-1 font-display text-[28px] font-bold leading-tight">{q.display}</div>
        {fb==='ok' && <div className="pointer-events-none absolute inset-0 grid place-items-center"><span className="animate-star-rise text-6xl">⭐</span></div>}
        <Confetti burst={burst}/>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt,i)=>{
          let cls=OPT_STYLES[i];
          if(fb==='ok') cls=opt===q.answer?'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]':`${OPT_STYLES[i]} opacity-40`;
          else if(fb==='bad'){ if(opt===q.answer) cls='bg-mint text-white shadow-[0_6px_0_#22a76b]'; else if(opt===picked) cls='animate-shake bg-[#ffe8d1] text-[#c07a2a] shadow-[0_6px_0_#f2d5b2]'; else cls=`${OPT_STYLES[i]} opacity-40`; }
          return <button key={i} type="button" onClick={()=>answer(opt)} disabled={fb!=='ask'} className={`h-[68px] rounded-3xl text-[26px] font-extrabold transition-all duration-150 active:translate-y-1 ${cls}`}>{opt}</button>;
        })}
      </div>
      <div className="mt-6 flex justify-center">
        <Mascot emoji={fb==='ok'?'🥳':fb==='bad'?'🤗':'🔢'} message={fb==='ok'?'Верно!':fb==='bad'?`Ответ: ${q.answer}`: cur==='next'?'Продолжи ряд!':'Найди лишнее!'} />
      </div>
    </main>
  );
}
