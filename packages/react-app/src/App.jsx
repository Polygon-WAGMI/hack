import "antd/dist/antd.css";
import React from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import { Header, ThemeSwitch } from "./components";
import { BuyingDetails, Home, ListingDetails, MenuBar, NFTContract, SelectNFT } from "./views";

function App(props) {
  return (
    <div className="App">
      <Header />

      <Switch>
        <Route exact path="/">
          <MenuBar />
          <Home />
        </Route>

        <Route exact path="/referrals">
          <MenuBar />
        </Route>

        <Route exact path="/listNFT">
          <SelectNFT />
        </Route>

        <Route path="/project/:nft_id">
          <MenuBar />
          <ListingDetails />
        </Route>

        <Route path="/buy/:nft_id">
          <BuyingDetails />
        </Route>

        <Route path="/mint">
          <NFTContract />
        </Route>
      </Switch>

      <ThemeSwitch />
    </div>
  );
}

export default App;
