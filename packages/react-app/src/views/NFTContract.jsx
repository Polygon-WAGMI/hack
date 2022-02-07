import { Button, Image, Row, Col } from "antd";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { useContract, useProvider, useSigner } from "wagmi";
import SampleTokenABI from "../abi/SampleToken.json";

const NFTContract = () => {
  const provider = useProvider();
  const [{ data: signer }] = useSigner();
  const [tokens, setTokens] = useState([]);
  const [update, setUpdate] = useState(0);

  const contract = useContract({
    addressOrName: "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
    contractInterface: SampleTokenABI,
    signerOrProvider: signer ?? provider,
  });

  const randomPicURI = "https://picsum.photos/" + ((new Date() % 200) + 100);

  useEffect(() => {
    (async () => {
      const maxTokenId = (await contract.getTokenId()).toNumber();
      const currTokens = [];
      for (let i = 1; i <= maxTokenId; i++) {
        currTokens.push({
          owner: await contract.ownerOf(i),
          uri: await contract.tokenURI(i),
        });
      }
      setTokens(currTokens);
    })();
  }, [contract, update]);

  const handleMint = useCallback(async () => {
    if (!signer) return;

    const addr = await signer.getAddress();
    const tx = await contract.mint(addr, randomPicURI);
    setUpdate(u => u + 1);
  }, [signer, contract, randomPicURI]);

  return (
    <>
      <Row>
        {tokens.map(t => (
          <Col key={t.uri}>
            <Image src={t.uri} />
            <p>{t.owner}</p>
          </Col>
        ))}
      </Row>
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
