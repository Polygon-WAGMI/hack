import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, useParams, useLocation } from "react-router-dom";
import { Card, Image, Button } from "antd";
import { referralList } from "./tempData/referralList";
import { useContractManager } from "../hooks/useContractManager";
import { useCallback } from "react";
import { ethers } from "ethers";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function BuyingDetails() {
  let { nft_id } = useParams();
  const queryParams = useQuery();
  const contract = useContractManager();
  const [listingDetail, setListingDetail] = useState();
  const [resourceUri, setResourceUri] = useState("");

  const shillerAddress = queryParams.get("shiller");

  useEffect(() => {
    if (!contract) return;
    (async () => {
      try {
        const listing = await contract.getListing(nft_id);
        setListingDetail(listing);

        const response = await fetch(listing.resourceUri);
        const responseJson = await response.json();
        setResourceUri(responseJson.image);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const buyNFT = useCallback(async () => {
    if (!nft_id || !contract) return;
    await contract.buyNFT(nft_id, shillerAddress, {
      value: listingDetail.listPrice.toString(),
    });
  }, [contract, listingDetail?.listPrice, nft_id, shillerAddress]);

  console.log("nft_id", nft_id);
  console.log("shiller address", shillerAddress);
  return (
    <div>
      <h1>BUY</h1>
      <Image width={200} src={resourceUri} />
      {!!listingDetail && (
        <div>
          <div>
            <b>Owner Address : </b> {listingDetail.ownerAddr}
          </div>
          <div>
            <b>Token Address : </b> {listingDetail.tokenAddr}
          </div>
          <div>
            <b>Listing Price : </b> {ethers.utils.formatEther(listingDetail.listPrice)}
          </div>
          <div>
            <b>Buyer Reward : </b> {listingDetail.buyerReward.toNumber()}
          </div>
          <div>
            <b>Promoter Reward </b> {listingDetail.promoterReward.toNumber()}
          </div>
          <div>
            <b>Image Url : </b>
            <a href={resourceUri} target="_blank" rel="noreferrer">
              {resourceUri}
            </a>
          </div>
          <br></br>
        </div>
      )}
      <div>
        <Button type="primary" size={"large"} onClick={buyNFT}>
          PURCHASE
        </Button>
      </div>
    </div>
  );
}

export default BuyingDetails;
