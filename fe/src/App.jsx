import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MalwareList from './pages/MalwareList';
import MalwareDetail from './pages/MalwareDetail';
import MalwareCreate from './pages/MalwareCreate';
import MalwareEdit from './pages/MalwareEdit';
import Stats from './pages/Stats';
import Siem from './pages/Siem';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="malware" element={<MalwareList />} />
          <Route path="malware/:id" element={<MalwareDetail />} />
          <Route path="malware/create" element={<MalwareCreate />} />
          <Route path="malware/:id/edit" element={<MalwareEdit />} />
          <Route path="stats" element={<Stats />} />
          <Route path="siem" element={<Siem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
