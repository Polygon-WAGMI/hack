import React from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { ListingCard, ExampleUI } from "../views"
import { ethers } from "ethers";
import { referralList } from "./tempData/referralList";
import { Row, Col } from 'antd';

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const allRefferalListings = referralList.map(project => <Col><ListingCard project={project}/> </Col>)

  return (
    <div>
      <Row>
      {allRefferalListings}
      </Row>
    </div>
  );
}

export default Home;
