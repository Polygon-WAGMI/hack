import { Button, Image, Row } from "antd";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { useContract, useProvider, useSigner } from "wagmi";
import SampleTokenABI from "../abi/SampleToken.json";

const NFTContract = () => {
  const provider = useProvider();
  const [{ data: signer }] = useSigner();
  const [tokens, setTokens] = useState([]);

  const contract = useContract({
    addressOrName: "0x9A676e781A523b5d0C0e43731313A708CB607508",
    contractInterface: SampleTokenABI,
    signerOrProvider: signer ?? provider,
  });

  const randomPicURI = "https://picsum.photos/" + ((new Date() % 200) + 100);

  useEffect(() => {
    (async () => {
      const maxTokenId = (await contract.getTokenId()).toNumber();
      const currTokens = [];
      console.log(maxTokenId);
      console.log(await contract.tokenURI(0));
      // for (let i = 0; i < maxTokenId; i++) {
      //   currTokens.push(await contract.tokenURI(i));
      // }
      // console.log(currTokens);
    })();
  }, [contract]);

  const handleMint = useCallback(async () => {
    if (!signer) return;

    console.log("minting");
    const addr = await signer.getAddress();
    const tx = await contract.mint(addr, randomPicURI);
    console.log(tx);
    console.log(await contract.tokenURI(0));
  }, [signer, contract, randomPicURI]);

  return (
    <>
      <Row>
        <Image src={randomPicURI} />
      </Row>
      <Row>
        <Button onClick={handleMint}>Mint</Button>
      </Row>
    </>
  );
};

export default NFTContract;
