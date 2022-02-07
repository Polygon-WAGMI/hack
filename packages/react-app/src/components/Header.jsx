import { PageHeader } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
// displays a page header

export default function Header() {
  const [{ data, error }, connect] = useConnect();
  const [{ data: account }, disconnect] = useAccount({ fetchEns: true });

  const connector = data.connectors.filter(c => c.ready)[0];

  return (
    <Link to={`/`}>
      <PageHeader title="🖼️ REFER-MY-NFT" subTitle="Sign up. Promote. Get Rewarded." style={{ cursor: "pointer" }} />

      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10, display: "flex" }}>
        <p>{account?.address}</p>
        {!account ? (
          <button onClick={() => connect(connector)}>{connector.name}</button>
        ) : (
          <button onClick={() => disconnect()}>Logout</button>
        )}
      </div>
    </Link>
  );
}
