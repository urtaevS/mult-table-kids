import { useState, type ReactNode } from 'react';
import BottomNav, { type NavKey } from './components/BottomNav';
import Decor from './components/Decor';
import { useProgress } from './lib/progress';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import ResultsScreen from './screens/ResultsScreen';
import TableScreen from './screens/TableScreen';
import TestScreen from './screens/TestScreen';
import TrainScreen from './screens/TrainScreen';
import type { Screen } from './types';

export default function App() {
  const { progress, recordAnswer, markStudied, finishTest, toast } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

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
      : screen.name === 'results' ? 'results'
      : null;

  const screenKey =
    screen.name === 'table' ? `table-${screen.table}`
      : screen.name === 'train' ? `train-${screen.table ?? 'mix'}`
      : screen.name;

  let view: ReactNode = null;
  switch (screen.name) {
    case 'home':    view = <HomeScreen progress={progress} go={go} />; break;
    case 'learn':   view = <LearnScreen progress={progress} go={go} />; break;
    case 'table':   view = <TableScreen n={screen.table} go={go} markStudied={markStudied} />; break;
    case 'train':   view = <TrainScreen progress={progress} table={screen.table} recordAnswer={recordAnswer} go={go} />; break;
    case 'test':    view = <TestScreen recordAnswer={recordAnswer} finishTest={finishTest} go={go} />; break;
    case 'results': view = <ResultsScreen progress={progress} go={go} />; break;
  }

  return (
    <div className="min-h-screen font-body text-ink">
      <Decor />
      <div key={screenKey} className="animate-screen-in">{view}</div>
      <BottomNav active={active} onNavigate={onNavigate} />
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