import { NavLink, Routes, Route } from 'react-router-dom';
import RecorderPage from './pages/RecorderPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Speech to Text</h1>
        <nav>
          <NavLink to="/" end>
            Live Transcribe
          </NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<RecorderPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
