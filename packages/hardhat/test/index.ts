import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use } from "chai";
import { MockContract } from "ethereum-waffle";
import { ethers, waffle } from "hardhat";
import ERC721 from "../artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json";
import { WagmiContract } from "../typechain";
import { NewListingEvent } from "../typechain/WagmiContract";

const { solidity, deployMockContract } = waffle;
const provider = waffle.provider;
use(solidity);

describe("WagmiContract", function () {
  let contract: WagmiContract;
  let mockErc721Contract: MockContract;
  let deployer: SignerWithAddress;
  let nftOwner: SignerWithAddress;
  let promoter: SignerWithAddress;
  let buyer: SignerWithAddress;
  let addr1: SignerWithAddress;

  const tokenIdOwnedByOwner = 1;
  const tokenIdNotOwnedByOwner = 2;

  async function createNewListing({
    tokenId = 1,
    listPrice = 1,
    promoterReward = 10,
    buyerReward = 10,
    depositValue = 0.2,
    owner = nftOwner,
  }) {
    return contract
      .connect(owner)
      .listNFT(
        mockErc721Contract.address,
        tokenId,
        ethers.utils.parseEther(listPrice.toString()),
        promoterReward,
        buyerReward,
        { value: ethers.utils.parseEther(depositValue.toString()) }
      );
  }

  before(async () => {
    [deployer, nftOwner, promoter, buyer, addr1] = await ethers.getSigners();

    mockErc721Contract = await deployMockContract(deployer, ERC721.abi);
    mockErc721Contract.mock.approve.returns();
    mockErc721Contract.mock.name.returns("MockToken");

    mockErc721Contract.mock.tokenURI
      .withArgs(tokenIdOwnedByOwner)
      .returns("ipfs://abcd");
    mockErc721Contract.mock.ownerOf
      .withArgs(tokenIdOwnedByOwner)
      .returns(nftOwner.address);
    mockErc721Contract.mock.getApproved
      .withArgs(tokenIdOwnedByOwner)
      .returns("0x0000000000000000000000000000000000000000");

    mockErc721Contract.mock.tokenURI
      .withArgs(tokenIdNotOwnedByOwner)
      .returns("ipfs://defg");
    mockErc721Contract.mock.ownerOf
      .withArgs(tokenIdNotOwnedByOwner)
      .returns(addr1.address);
    mockErc721Contract.mock.getApproved
      .withArgs(tokenIdNotOwnedByOwner)
      .returns("0x0000000000000000000000000000000000000000");
  });

  beforeEach(async () => {
    const WagmiContract = await ethers.getContractFactory("WagmiContract");
    contract = await WagmiContract.deploy();
    await contract.deployed();
  });

  it("should approve NFT owned by sender", async () => {
    await expect(
      contract
        .connect(nftOwner)
        .approveWagmi(mockErc721Contract.address, tokenIdOwnedByOwner)
    ).to.not.be.reverted;
  });

  it("should not approve NFT not owned by sender", async () => {
    await expect(
      contract
        .connect(nftOwner)
        .approveWagmi(mockErc721Contract.address, tokenIdNotOwnedByOwner)
    ).to.be.revertedWith("Token is not owned by caller");
  });

  it("should list a new NFT", async () => {
    await expect(createNewListing({}))
      .to.emit(contract, "NewListing")
      .withArgs(0);
  });

  it("should have unique listingIds on consecutive listings", async () => {
    await expect(createNewListing({}))
      .to.emit(contract, "NewListing")
      .withArgs(0);
    await expect(createNewListing({}))
      .to.emit(contract, "NewListing")
      .withArgs(1);
  });

  it("should revert if deposit value is wrong", async () => {
    await expect(createNewListing({ depositValue: 0 })).to.be.revertedWith(
      "Expected deposit is wrong"
    );
  });

  it("should return the correct listing", async () => {
    await createNewListing({ tokenId: 1 });
    await createNewListing({ tokenId: 2, owner: addr1 });

    const listings = await contract.getListings();

    expect(listings.length).to.equal(2);
    expect(listings[0].tokenAddr).to.equal(mockErc721Contract.address);
    expect(listings[0].tokenId).to.equal(1);
    expect(listings[0].ownerAddr).to.equal(nftOwner.address);
    expect(listings[0].listPrice).to.equal(ethers.utils.parseEther("1"));
    expect(listings[0].promoterReward).to.equal(10);
    expect(listings[0].buyerReward).to.equal(10);
    expect(listings[0].resourceUri).to.equal("ipfs://abcd");
    expect(listings[0].resourceName).to.equal("MockToken");

    expect(listings[1].tokenAddr).to.equal(mockErc721Contract.address);
    expect(listings[1].tokenId).to.equal(2);
    expect(listings[1].ownerAddr).to.equal(addr1.address);
    expect(listings[1].listPrice).to.equal(ethers.utils.parseEther("1"));
    expect(listings[1].promoterReward).to.equal(10);
    expect(listings[1].buyerReward).to.equal(10);
    expect(listings[1].resourceUri).to.equal("ipfs://defg");
    expect(listings[1].resourceName).to.equal("MockToken");
  });
});
