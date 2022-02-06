import { PageHeader } from "antd";
import React from "react";
import {
  Link,
} from "react-router-dom";
// displays a page header

export default function Header() {
  return (
    <Link to={`/`}> 
      <PageHeader
        title="🖼️ REFER-MY-NFT"
        subTitle="Sign up. Promote. Get Rewarded."
        style={{ cursor: "pointer" }}
      />
      </Link>
  );
}
