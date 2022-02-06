import "antd/dist/antd.css";
import { providers } from "ethers";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { chain, Provider as WagmiProvider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import "./App.css";
import { Header, ThemeSwitch } from "./components";
import { BuyingDetails, Home, ListingDetails, MenuBar } from "./views";

const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({
      chains: [chain.hardhat],
      options: { shimDisconnect: true },
    }),
  ];
};

const provider = ({ chainId }) => new providers.JsonRpcProvider(chain.hardhat);

function App(props) {
  return (
    <WagmiProvider autoConnect provider={provider} connectors={connectors}>
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

          <Route path="/project/:nft_id">
            <MenuBar />
            <ListingDetails />
          </Route>

          <Route path="/buy/:nft_id">
            <BuyingDetails />
          </Route>
        </Switch>

        <ThemeSwitch />
      </div>
    </WagmiProvider>
  );
}

export default App;
