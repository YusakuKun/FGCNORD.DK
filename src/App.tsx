import { Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { BlivMedlem } from "@/pages/BlivMedlem";
import { Home } from "@/pages/Home";
import { Om } from "@/pages/Om";
import { Placeholder } from "@/pages/Placeholder";
import { PowerRankingDetail } from "@/pages/PowerRankingDetail";
import { PowerRankings } from "@/pages/PowerRankings";
import { StageStrike } from "@/pages/StageStrike";
import { TournamentBracket } from "@/pages/TournamentBracket";
import { TournamentLanding } from "@/pages/TournamentLanding";
import { TournamentMe } from "@/pages/TournamentMe";
import { Turneringer } from "@/pages/Turneringer";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="turneringer" element={<Turneringer />} />
        <Route path="stage-strike" element={<StageStrike />} />
        <Route path="t/:code" element={<TournamentLanding />} />
        <Route path="t/:code/mig" element={<TournamentMe />} />
        <Route path="t/:code/bracket" element={<TournamentBracket />} />
        <Route path="pr" element={<PowerRankings />} />
        <Route path="pr/:slug" element={<PowerRankingDetail />} />
        <Route path="om" element={<Om />} />
        <Route path="bliv-medlem" element={<BlivMedlem />} />
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  );
}

export default App;
