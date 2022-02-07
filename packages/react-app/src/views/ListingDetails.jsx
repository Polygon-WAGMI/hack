import { Button, Card, Image, Typography } from "antd";
import { BigNumber } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useProvider } from "wagmi";
import { ethers } from "../../../hardhat/node_modules/ethers/lib";
import { useContractManager } from "../hooks/useContractManager";
import { referralList } from "./tempData/referralList";
const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;
const size = "large";

function ListingDetails() {
  const [{ data: address }] = useAccount();

  const [resourceUri, setResourceUri] = useState("");
  let { nft_id } = useParams();
  const itemDetail = () => referralList.filter(obj => obj.id == nft_id)[0];
  const [uniqueUrl, setUniqueUrl] = useState(`${process.env.PUBLIC_URL}/dark-thsdsdseme.css`);
  const [listingDetail, setListingDetail] = useState({
    tokenAddr: "123",
    tokenId: 2,
    listPrice: ethers.utils.parseEther("0.00005"),
    promoterReward: BigNumber.from("15"),
    buyerReward: BigNumber.from("20"),
  });
  const [currentAddress, setCurrentAddress] = useState(null);
  const provider = useProvider();
  const [isPromoter, setIsPromoter] = useState(false);

  const contract = useContractManager();
  const baseUri = useRef("");
  //SET LISTING DUMMY NFT
  const _tokenAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const _tokenId = 9;
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

  const SignUpButton = [];
  // if (web3Modal) {
  //   if (web3Modal.cachedProvider) {
  //     SignUpButton.push(
  //       <Button
  //         type="primary"
  //         key="logoutbutton"
  //         style={{ verticalAlign: "top", marginLeft: 8, margin: 4 }}
  //         size="large"
  //         shape="round"
  //         // onClick={alert('Sign Contract')}
  //       >
  //         Sign Up as Promoter
  //       </Button>,
  //     );
  //   } else {
  //     SignUpButton.push(
  //       <Button
  //         key="loginbutton"
  //         style={{ verticalAlign: "top", marginLeft: 8, margin: 20 }}
  //         shape="round"
  //         size="large"
  //         /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
  //         onClick={loadWeb3Modal}
  //       >
  //         Connect your Wallet & Sign Up as Promoter
  //       </Button>,
  //     );
  //   }
  // }

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

          <div>
            <b>Unique Referral Url : </b>
          </div>
          <Button>
            <Title copyable mark level={5}>
              {`${baseUri.current}/buy/${nft_id}?shiller=${address}`}
            </Title>
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
