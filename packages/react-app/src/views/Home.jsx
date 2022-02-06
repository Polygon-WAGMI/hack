import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { ListingCard, ExampleUI } from "../views";
import { ethers } from "ethers";
import { referralList } from "./tempData/referralList";
import { Row, Col, Empty } from "antd";
import { useContractManager } from "../hooks/useContractManager";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts, userSigner }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const contract = useContractManager(userSigner);
  const [listings, setListings] = useState([]);

  const allRefferalListings = listings.map(project => (
    <Col>
      <ListingCard project={project} />
    </Col>
  ));

  console.log("AI");
  useEffect(() => {
    if (!contract) return;
    (async () => {
      try {
        const listings = await contract.getListings();
        setListings(listings);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div>
      {allRefferalListings.length == 0 ? (
        <div style={{ margin: 100 }}>
          <Empty description="No NFTs are being listed for referral" />
        </div>
      ) : (
        <Row> {allRefferalListings} </Row>
      )}
    </div>
  );
}

export default Home;
