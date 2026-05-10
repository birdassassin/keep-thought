import { useState } from 'react';
import {
  ActionsDemo,
  UseOptimisticDemo,
  UseDemo,
  RefAsPropDemo,
  FormActionsDemo,
  MetadataDemo
} from './demos';
import './App.css';

type DemoType = 'actions' | 'optimistic' | 'use' | 'ref' | 'forms' | 'metadata';

const demos: { id: DemoType; label: string; component: React.FC }[] = [
  { id: 'actions', label: 'Actions', component: ActionsDemo },
  { id: 'optimistic', label: 'useOptimistic', component: UseOptimisticDemo },
  { id: 'use', label: 'use()', component: UseDemo },
  { id: 'ref', label: 'ref as prop', component: RefAsPropDemo },
  { id: 'forms', label: 'Form Actions', component: FormActionsDemo },
  { id: 'metadata', label: 'Metadata', component: MetadataDemo },
];

function App() {
  const [activeDemo, setActiveDemo] = useState<DemoType>('actions');

  const ActiveComponent = demos.find(d => d.id === activeDemo)?.component || ActionsDemo;

  return (
    <div className="app">
      <header className="app-header">
        <h1>React 19 新特性演示</h1>
        <p>探索 React 19 带来的激动人心的新功能</p>
      </header>

      <nav className="demo-nav">
        {demos.map(demo => (
          <button
            key={demo.id}
            className={`nav-btn ${activeDemo === demo.id ? 'active' : ''}`}
            onClick={() => setActiveDemo(demo.id)}
          >
            {demo.label}
          </button>
        ))}
      </nav>

      <main className="demo-main">
        <ActiveComponent />
      </main>

      <footer className="app-footer">
        <p>
          React 19 于 2024 年 12 月 5 日正式发布 |
          <a href="https://react.dev/blog/2024/12/05/react-19" target="_blank" rel="noopener noreferrer">
            官方文档
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
