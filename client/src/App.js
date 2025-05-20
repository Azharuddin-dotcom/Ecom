import React from "react";
import Header from "./components/headers/Header.js";
import Pages from "./components/mainpages/Pages.js";
import { BrowserRouter as Router } from "react-router-dom";
import { DataProvider } from "./GlobalState.js";

const App = () => {
  return (
    <DataProvider>
      <Router>
        <div className="App">
          <Header />
          <Pages />
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;
