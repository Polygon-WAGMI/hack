import "antd/dist/antd.css";
import { providers } from "ethers";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { chain, Provider as WagmiProvider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import "./App.css";
import {
  Account,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, ExampleUI, Hints, Subgraph, ListingDetails, MenuBar, BuyingDetails, SelectNFT } from "./views";
import { useStaticJsonRPC } from "./hooks";


const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({
      chains: [chain.hardhat],
      options: { shimDisconnect: true },
    }),
  ];
};

const provider = ({ chainId }) => new providers.JsonRpcProvider(chain.hardhat.rpcUrls[0]);

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

          <Route exact path="/listNFT">
            <SelectNFT
                address={address}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                localProvider={localProvider}
                yourLocalBalance={yourLocalBalance}
                price={price}
                tx={tx}
                writeContracts={writeContracts}
                readContracts={readContracts}
                purpose={purpose}
            />
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
