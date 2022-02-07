import { Button, Select, Form, Divider, Input, Option, Slider, Modal, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

// import "./styles.css";

export default function SelectNFT() {
  const [{ data: account }] = useAccount();
  const [newPurpose, setNewPurpose] = useState("loading...");

  const axios = require("axios");

  const [NFTDetails, setNFTDetails] = useState([]);
  const [ImageURIs, setImageURIs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  let NFTDataPromise = axios.get(
    `https://deep-index.moralis.io/api/v2/${account?.address}/nft?chain=eth&format=hex&token_addresses=`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": "o7LipgnlcvThrWUfSPYfHBYl01I1J94hxzM1FZSzziIrqO8ducomL2buD3DVORCd",
      },
    },
  );

  useEffect(() => {
    (async () => {
      const NFT = await NFTDataPromise;
      console.log("NFT:", NFT);
      setNFTDetails(NFT);

      let NFTArraysResult = NFT.data.result;

      const imagesPromises = [];

      for (let i = 0; i < NFTArraysResult.length; i++) {
        let token_uri = NFTArraysResult[i].token_uri;
        console.log("token_uri", token_uri);

        imagesPromises.push(axios.get(token_uri));
      }

      const imagesUnparsed = await Promise.all(imagesPromises);
      console.log("Images unparsed ", imagesUnparsed);

      const ImageURIs = [];

      imagesUnparsed.map(img => {
        console.log(img.data.image);
        const ipfsLink = img.data.image;

        const regex = /(?<=[i]pfs:\/\/).*/;
        const [ipfsHash] = ipfsLink.match(regex) || [];
        if (ipfsHash) {
          console.log("TRUEEEE");
          const ImageUri = "https://ipfs.io/ipfs/" + ipfsHash;
          ImageURIs.push(ImageUri);
          console.log(ImageUri);
        } else {
          console.log("FALSEE");
          ImageURIs.push(ipfsLink);
        }
      });

      setImageURIs(ImageURIs);
    })();
  }, []);

  const NFTOptions = [];

  let ImageStyle = {
    width: "250px",
    height: "250px",
    marginTop: "10pt",
    marginBottom: "10pt",
    boxSizing: "border-box",
  };

  let BorderStyle = {
    backgroundColor: "#FFFFFF",
  };

  let BorderStyle2 = {
    backgroundColor: "#b7e7ff",
  };

  const clickImage = index => {
    console.log("Index:", index);
    setSelectedIndex(index);
    setSelectedItem(ImageURIs[selectedIndex]);
  };

  let itemList = ImageURIs.map((item, index) => {
    // console.log("Item",item)
    // console.log("selected index", selectedIndex)
    // console.log(index == selectedIndex)
    return (
      <div style={index == selectedIndex ? BorderStyle2 : BorderStyle}>
        {" "}
        <img src={item} alt="new" style={ImageStyle} onClick={() => clickImage(index)} />{" "}
      </div>
    );
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const [form] = Form.useForm();

  const onFinish = values => {
    const token_address = NFTDetails.data.result[selectedIndex].token_address;
    const token_id = NFTDetails.data.result[selectedIndex].token_id;
    const price = values.listingPrice.amount;
    const bountyRate = values.bountyRate;
    const discountRate = values.discountRate;

    console.log(typeof values);
    console.log(values);
    console.log("token_address", token_address);
    console.log("token_id", token_id);
    console.log("price", price);
    console.log("bountyRate", bountyRate);
    console.log("discountRate", discountRate);

    setIsModalVisible(false);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    form.setFieldsValue({
      discountRate: "3",
      bountyRate: "2",
    });
  };

  const { Option } = Select;

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Your NFT:</h2>
        <Divider />
        <ul>{itemList}</ul>
        <Divider />
        <Link to="/" className="btn btn-primary">
          <Button>Back</Button>
        </Link>
        <Button
          type="primary"
          onClick={selectedIndex != null ? showModal : undefined}
          style={{ background: "blue", borderColor: "blue" }}
        >
          List
        </Button>
        <Modal title="Basic Modal" visible={isModalVisible} footer={null}>
          <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
            <Form.Item label="Listing Price">
              <Input.Group compact>
                <Form.Item
                  name={["listingPrice", "amount"]}
                  noStyle
                  rules={[{ required: true, message: "Price amount is required" }]}
                >
                  <Input style={{ width: "50%" }} placeholder="Amount" />
                </Form.Item>
                <Form.Item
                  name={["listingPrice", "currency"]}
                  noStyle
                  rules={[{ required: true, message: "Currency is required" }]}
                >
                  <Select placeholder="Select currency">
                    <Option value="ETH">ETH</Option>
                  </Select>
                </Form.Item>
              </Input.Group>
            </Form.Item>
            <Form.Item name="discountRate" label="Discount Rate (in %)" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="bountyRate" label="Bounty Rate (in %)" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Reset
              </Button>
              <Button type="link" htmlType="button" onClick={onFill}>
                Fill form
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
