import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "antd/dist/antd.css";
import { providers } from "ethers";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { chain, Provider as WagmiProvider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import App from "./App";
import "./App.css";
import "./index.css";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({
      chains: [chain.hardhat],
      options: { shimDisconnect: true },
    }),
  ];
};

const provider = ({ chainId }) => new providers.JsonRpcProvider(chain.hardhat.rpcUrls[0]);

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
      <BrowserRouter>
        <WagmiProvider autoConnect provider={provider} connectors={connectors}>
          <App subgraphUri={subgraphUri} />
        </WagmiProvider>
      </BrowserRouter>
    </ThemeSwitcherProvider>
  </ApolloProvider>,
  document.getElementById("root"),
);
