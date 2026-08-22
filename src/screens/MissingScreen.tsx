import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import Mascot from '../components/Mascot';
import { OPT_STYLES } from '../lib/styles';
import { makeMissingQuestion, type MissingQuestion } from '../lib/missing';
import { playCorrect, playWrong } from '../lib/sounds';
import type { MissingOp, Screen } from '../types';

const OPS: { id: MissingOp; label: string; desc: string }[] = [
  { id: 'mul', label: 'Умножение', desc: '×' },
  { id: 'div', label: 'Деление', desc: '÷' },
  { id: 'add', label: 'Сложение', desc: '+' },
  { id: 'sub', label: 'Вычитание', desc: '−' },
  { id: 'mix', label: 'Вперемешку', desc: '×÷+−' },
];

interface Props { op?: MissingOp; recordAnswer: (t:number,c:boolean)=>void; recordMissing: (o:MissingOp,c:boolean)=>void; go:(s:Screen)=>void; }

export default function MissingScreen({ op, recordAnswer, recordMissing, go }: Props) {
  const [cur, setCur] = useState<MissingOp|null>(op ?? null);
  const [q, setQ] = useState<MissingQuestion|null>(null);
  const [fb, setFb] = useState<'ask'|'ok'|'bad'>('ask');
  const [picked, setPicked] = useState<number|null>(null);
  const [burst, setBurst]=useState(0);
  const timer=useRef<number|undefined>(undefined);
  useEffect(()=>()=>window.clearTimeout(timer.current),[]);

  const start=(o:MissingOp)=>{ setCur(o); const qq=makeMissingQuestion(o); setQ(qq); setFb('ask'); setPicked(null); };
  useEffect(()=>{ if(op && !cur) start(op); },[op]);

  const answer=(opt:number)=>{
    if(fb!=='ask'||!q||!cur) return;
    const ok=opt===q.answer;
    recordAnswer(2, ok); recordMissing(cur, ok);
    if(ok){ playCorrect(); setBurst(b=>b+1);} else playWrong();
    setPicked(opt); setFb(ok?'ok':'bad');
    timer.current=window.setTimeout(()=>{ setQ(makeMissingQuestion(cur,q)); setFb('ask'); setPicked(null); }, ok?700:1100);
  };

  if(!cur || !q){
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8">
        <button type="button" onClick={()=>go({name:'home'})} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"><ArrowLeft size={24} strokeWidth={2.8}/></button>
        <h1 className="mt-4 font-display text-2xl font-bold">❓ Пропуск</h1>
        <p className="mt-1 text-sm font-extrabold text-[#8d84a3]">Вставь пропущенную цифру</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {OPS.map(o=>(
            <button key={o.id} type="button" onClick={()=>start(o.id)} className="flex flex-col items-center gap-1 rounded-3xl bg-white px-3 py-4 text-center font-extrabold shadow-[0_6px_0_#f0e7d6] active:translate-y-1">
              {o.id === 'mix' ? (
                <span className="grid h-10 w-10 grid-cols-2 place-items-center gap-0 rounded-2xl bg-candy-soft text-[13px] font-black leading-none text-[#c74e7d]">
                  <span>×</span><span>÷</span><span>+</span><span>−</span>
                </span>
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-candy-soft text-lg">{o.desc}</span>
              )}
              <span className="text-sm leading-none">{o.label}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }
  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={()=>{ setCur(null); setQ(null); }} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"><ArrowLeft size={24} strokeWidth={2.8}/></button>
        <h1 className="flex-1 text-center font-display text-base font-bold">❓ Пропуск</h1>
        <button type="button" onClick={()=>go({name:'home'})} className="rounded-full bg-white px-3 py-2 text-xs font-extrabold shadow-[0_3px_0_#ece3d2]">🏠</button>
      </div>
      <div className="relative mt-5 rounded-blob bg-white p-7 text-center shadow-[0_6px_0_#f0e7d6]">
        <div className="font-display text-[34px] font-bold leading-none">{q.text}</div>
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
        <Mascot emoji={fb==='ok'?'🥳':fb==='bad'?'🤗':'❓'} message={fb==='ok'?'Верно!':fb==='bad'?`Ответ: ${q.answer}`:'Найди пропуск!'} />
      </div>
    </main>
  );
}
