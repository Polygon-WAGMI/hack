import { Card, Avatar, Row, Col } from "antd";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "../../../hardhat/node_modules/ethers/lib";

const { Meta } = Card;

function ListingCard({ project }) {
  const { name, resourceUri, id, listPrice, promoterReward, buyerReward } = project;
  const [nftUrl, setNftUrl] = useState("");

  useEffect(() => {
    fetch(resourceUri)
      .then(res => res.json())
      .then(
        result => {
          setNftUrl(result.image);
        },
        error => {
          console.err("error");
        },
      );
  }, [resourceUri]);

  return (
    <Link to={`project/${id}`}>
      <div>
        <Card style={{ width: 300, margin: 10 }} cover={<img alt="example" src={nftUrl} />} hoverable>
          <div>
            <b>Listing Price : </b> <p>{ethers.utils.formatEther(listPrice)}</p>
          </div>
          <div>
            <b>Promoter Reward : </b> <p>{promoterReward.toNumber()} %</p>
          </div>
          <div>
            <b>Buyer Reward : </b> <p>{buyerReward.toNumber()} %</p>
          </div>
        </Card>
      </div>
    </Link>
  );
}

export default ListingCard;
