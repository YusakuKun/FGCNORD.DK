import { Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { BlivMedlem } from "@/pages/BlivMedlem";
import { Home } from "@/pages/Home";
import { Om } from "@/pages/Om";
import { Placeholder } from "@/pages/Placeholder";
import { StageStrike } from "@/pages/StageStrike";
import { Turneringer } from "@/pages/Turneringer";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="turneringer" element={<Turneringer />} />
        <Route path="stage-strike" element={<StageStrike />} />
        <Route path="om" element={<Om />} />
        <Route path="bliv-medlem" element={<BlivMedlem />} />
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  );
}

export default App;
