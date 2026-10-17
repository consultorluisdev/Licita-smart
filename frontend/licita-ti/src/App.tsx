import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AllLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AllLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
