import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AllLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Licitacoes } from "./pages/Licitacoes";
import { Agent } from "./pages/Agent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AllLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="licitacoes" element={<Licitacoes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="agent" element={<Agent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
