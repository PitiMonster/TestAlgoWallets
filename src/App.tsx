import React from "react";
import AlgoSigner from "./pages/AlgoSignerPage";
import MyAlgoWallet from "./pages/MyAlgoWalletPage";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/algosigner" element={<AlgoSigner />} />
        <Route path="/myalgowallet" element={<MyAlgoWallet />} />
      </Routes>
    </div>
  );
};

export default App;
