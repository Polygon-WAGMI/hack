import React, { useEffect, useState, useRef, useMemo } from "react";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import { Card, Image, Button, Typography } from "antd";
import { ethers } from "ethers";
import { useContractManager } from "../hooks/useContractManager";
const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;
const size = "large";

function ListingDetails({ id, userSigner, web3Modal, loadWeb3Modal }) {
  let { nft_id } = useParams();
  const [listingDetail, setListingDetail] = useState();
  const [currentAddress, setCurrentAddress] = useState(null);
  const [resourceUri, setResourceUri] = useState("");
  const [isPromoter, setIsPromoter] = useState(false);

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
      if (!signer._address) {
        setCurrentAddress(null);
        return;
      }
      const currAddress = await signer.getAddress();
      setCurrentAddress(currAddress);
    };

    getCurrentAddress();
  }, [provider]);

  useEffect(() => {
    const fetchIsUserPromoter = async () => {
      const isPromoter = await contract.isPromoter();
      setIsPromoter(isPromoter);
    };
    fetchIsUserPromoter();
  }, []);

  useEffect(() => {
    const handleNewListing = listingId => {
      // redirect to listing page
      window.location.href = "/project" + listingId;
    };

    contract.on("NewListing", handleNewListing);

    return () => {
      contract.off("NewListing", handleNewListing);
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

  const SignUpButton = () => {
    if (web3Modal) {
      if (web3Modal.cachedProvider) {
        return (
          <Button
            type="primary"
            key="logoutbutton"
            style={{ verticalAlign: "top", marginLeft: 8, margin: 4 }}
            size="large"
            shape="round"
            onClick={async () => {
              await contract.promoterSignUp();
              // TODO: Maybe listen to analytics here?
              setIsPromoter(true);
            }}
            disabled={isPromoter}
            style={{
              marginBottom: 16,
            }}
          >
            {isPromoter ? "Congratulations! " : "Sign Up as Promoter"}
          </Button>
        );
      } else {
        return (
          <Button
            key="loginbutton"
            style={{ verticalAlign: "top", marginLeft: 8, margin: 20 }}
            shape="round"
            size="large"
            /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
            onClick={loadWeb3Modal}
          >
            Connect your Wallet & Sign Up as Promoter
          </Button>
        );
      }
    }
  };

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

  return (
    <div>
      {!listingDetail ? (
        <div>
          <Button
            type="primary"
            size={size}
            onClick={async () => {
              await contract.listNFT(_tokenAddr, _tokenId, _listPrice, _promoterReward, _buyerReward);
            }}
          >
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
              <SignUpButton />

              {isPromoter && (
                <div>
                  <b>Unique Referral Url : </b>
                  <Button>
                    <Title copyable mark level={5}>
                      {`${baseUri.current}/buy/${nft_id}?shiller=${currentAddress}`}
                    </Title>
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListingDetails;
