import { useEffect, useState, type ReactNode } from 'react';
import BottomNav, { type NavKey } from './components/BottomNav';
import { initSounds, playBg } from './lib/sounds';
import Decor from './components/Decor';
import { useProgress } from './lib/progress';
import ArithmeticScreen from './screens/ArithmeticScreen';
import HomeScreen from './screens/HomeScreen';
import MissingScreen from './screens/MissingScreen';
import SequenceScreen from './screens/SequenceScreen';
import LearnScreen from './screens/LearnScreen';
import ResultsScreen from './screens/ResultsScreen';
import TableScreen from './screens/TableScreen';
import TestScreen from './screens/TestScreen';
import TimeAttackScreen from './screens/TimeAttackScreen';
import TrainScreen from './screens/TrainScreen';
import UpdateBanner from './components/UpdateBanner';
import type { Screen } from './types';

export default function App() {
  const { progress, recordAnswer, recordArithmetic, recordMissing, recordSequence, markStudied, finishTest, finishTimeAttack, resetProgress, importProgress, toast } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  // тихий фон после первого взаимодействия (требование браузеров)
  useEffect(() => {
    let started = false;
    const kick = () => {
      if (started) return; started = true;
      void initSounds().then(on => { if (on) playBg(); });
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('keydown', kick, { once: true });
    return () => { window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); };
  }, []);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  };

  const onNavigate = (k: NavKey) => {
    if (k === 'home') go({ name: 'home' });
    else if (k === 'learn') go({ name: 'learn' });
    else if (k === 'train') go({ name: 'train' });
    else go({ name: 'results' });
  };

  const active: NavKey | null =
    screen.name === 'home' ? 'home'
      : screen.name === 'learn' || screen.name === 'table' ? 'learn'
      : screen.name === 'train' ? 'train'
      : screen.name === 'time-attack' ? 'train'
      : screen.name === 'arithmetic' ? 'train'
      : screen.name === 'missing' ? 'train'
      : screen.name === 'sequence' ? 'train'
      : screen.name === 'results' ? 'results'
      : null;

  const screenKey =
    screen.name === 'table' ? `table-${screen.table}`
      : screen.name === 'train' ? `train-${screen.table ?? 'mix'}`
      : screen.name === 'time-attack' ? `ta-${screen.difficulty ?? 'pick'}`
      : screen.name === 'arithmetic' ? `arith-${screen.op ?? 'pick'}`
      : screen.name === 'missing' ? `miss-${screen.op ?? 'pick'}`
      : screen.name === 'sequence' ? `seq-${screen.kind ?? 'pick'}`
      : screen.name;

  let view: ReactNode = null;
  switch (screen.name) {
    case 'home':    view = <HomeScreen progress={progress} go={go} />; break;
    case 'learn':   view = <LearnScreen progress={progress} go={go} />; break;
    case 'table':   view = <TableScreen n={screen.table} go={go} markStudied={markStudied} />; break;
    case 'train':   view = <TrainScreen progress={progress} table={screen.table} recordAnswer={recordAnswer} go={go} />; break;
    case 'test':    view = <TestScreen recordAnswer={recordAnswer} finishTest={finishTest} go={go} />; break;
    case 'time-attack': view = <TimeAttackScreen difficulty={screen.difficulty} recordAnswer={recordAnswer} finishTimeAttack={finishTimeAttack} go={go} />; break;
    case 'arithmetic': view = <ArithmeticScreen op={screen.op} recordAnswer={recordAnswer} recordArithmetic={recordArithmetic} go={go} />; break;
    case 'missing': view = <MissingScreen op={screen.op} recordAnswer={recordAnswer} recordMissing={recordMissing} go={go} />; break;
    case 'sequence': view = <SequenceScreen kind={screen.kind} recordAnswer={recordAnswer} recordSequence={recordSequence} go={go} />; break;
    case 'results': view = <ResultsScreen progress={progress} go={go} resetProgress={resetProgress} importProgress={importProgress} />; break;
  }

  return (
    <div className="min-h-screen font-body text-ink">
      <Decor />
      <div key={screenKey} className="animate-screen-in">{view}</div>
      <BottomNav active={active} onNavigate={onNavigate} />
      <UpdateBanner current={`v${__APP_VERSION__}`} />
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="animate-toast rounded-full bg-ink px-5 py-2.5 font-extrabold text-white shadow-xl">
            🏆 Новое достижение: {toast}
          </div>
        </div>
      )}
    </div>
  );
}