import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Home } from "./pages/Home";
import { Arena } from "./pages/Arena";
import { Leaderboard } from "./pages/Leaderboard";
import { Daily } from "./pages/Daily";
import { AuthPage } from "./pages/AuthPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/play/:trackId" element={<Arena />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/board" element={<Leaderboard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
