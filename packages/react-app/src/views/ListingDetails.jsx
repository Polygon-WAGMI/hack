import React, { useEffect, useState, useRef, useMemo } from "react";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import { Card, Image, Button, Typography } from "antd";
import { referralList } from "./tempData/referralList";
import { Link } from "react-router-dom";
import { NETWORKS } from "../constants";
import wagmiABI from "../abi/wagmi.json";
import { useContractRead, useSigner, useAccount } from "wagmi";
import { ethers } from "../../../hardhat/node_modules/ethers/lib";
import { useContractManager } from "../hooks/useContractManager";
import { BigNumber } from "ethers";
import { useCallback } from "react";
const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;
const size = "large";
function ListingDetails({ address, id, userSigner, web3Modal, loadWeb3Modal }) {
  let { nft_id } = useParams();
  const [listingDetail, setListingDetail] = useState();
  const [currentAddress, setCurrentAddress] = useState("");
  const [resourceUri, setResourceUri] = useState("");

  const provider = useMemo(() => new ethers.providers.Web3Provider(window.ethereum), []);

  const contract = useContractManager(userSigner);
  const baseUri = useRef("");

  // SET LISTING DUMMY NFT (REMOVE)
  const _tokenAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const _tokenId = 1;
  const _listPrice = ethers.utils.parseEther("0.00005");
  const _promoterReward = 15;
  const _buyerReward = 20;

  useEffect(() => {
    const getCurrentAddress = async () => {
      const signer = provider.getSigner();
      const currAddress = await signer.getAddress();
      setCurrentAddress(currAddress);
    };

    getCurrentAddress();
  }, []);

  useEffect(() => {
    contract.on("NewListing", listingId => {
      console.log("Navigate to new listing");
    });

    return () => {
      contract.off("NewListing", listingId => {
        console.log("Unmount after navigation");
      });
    };
  }, []);

  // IIFE
  useEffect(() => {
    if (!contract) return;
    (async () => {
      try {
        const listing = await contract.getListing(nft_id);
        setListingDetail(listing);

        const result = await fetch(listing.resourceUri);
        const resultData = await result.json();
        setResourceUri(resultData.image);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    baseUri.current = window.location.host;
  }, []);

  const SignUpButton = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      SignUpButton.push(
        <Button
          type="primary"
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, margin: 4 }}
          size="large"
          shape="round"
          // onClick={alert('Sign Contract')}
        >
          Sign Up as Promoter
        </Button>,
      );
    } else {
      SignUpButton.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, margin: 20 }}
          shape="round"
          size="large"
          /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
          onClick={loadWeb3Modal}
        >
          Connect your Wallet & Sign Up as Promoter
        </Button>,
      );
    }
  }

  const PromoteButton = (
    <div>
      <Button
        type="primary"
        key="logoutbutton"
        style={{ verticalAlign: "top", marginLeft: 8, margin: 4 }}
        size="large"
        disabled
        // onClick={logoutOfWeb3Modal}
      >
        Sign Up as Promoter
      </Button>
    </div>
  );

  const listUserNFT = useCallback(
    async (tokenAddr, tokenId, listPrice, promoterReward, buyerReward) => {
      await contract.listUserNFT(tokenAddr, tokenId, listPrice, promoterReward, buyerReward);
    },
    [contract],
  );

  return (
    <div>
      {!listingDetail ? (
        <div>
          <Button type="primary" size={size} onClick={listUserNFT}>
            LIST NFT
          </Button>
        </div>
      ) : (
        <>
          <Image
            width={200}
            src={resourceUri}
            style={{
              borderRadius: 16,
            }}
          />
          <h1>{listingDetail?.name}</h1>
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

              {SignUpButton}

              <div>
                <b>Unique Referral Url : </b>
              </div>
              <Button>
                <Title copyable mark level={5}>
                  {`${baseUri.current}/buy/${nft_id}?shiller=${currentAddress}`}
                </Title>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListingDetails;
