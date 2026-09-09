import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BudgetsPage from './pages/BudgetsPage.jsx';
import ExpensePage from './pages/ExpensePage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BudgetsPage />} />
        <Route path="/expenses" element={<ExpensePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;