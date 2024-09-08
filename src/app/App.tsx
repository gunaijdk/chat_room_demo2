// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetName from './page';
import ChatRoom from './login/page';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SetName />} />
        <Route path="/index" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;