import { Col, Empty, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useContractManager } from "../hooks/useContractManager";
import { ListingCard } from "../views";

function Home() {
  const contract = useContractManager();
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
        console.log("LISTINGS", listings);
        setListings(listings);
      } catch (err) {
        console.log("ERROR LISTINGS", listings);

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
