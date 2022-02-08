pragma solidity >=0.8.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract WagmiContract is ReentrancyGuard {
  using SafeMath for uint256;
  struct Listing {
    // Identifier
    uint256 id;
    // a boolean to check that the listing exists.
    bool exists;
    // address of the NFT contract.
    address tokenAddr;
    // id of the token on the NFT contract.
    uint256 tokenId;
    // address of the owner.
    address ownerAddr;
    // price of the NFT to be sold at, in base 10^18.
    uint256 listPrice;
    // commission given to promoters for referring people, in base 10^2.
    uint256 promoterReward;
    // discount given to buyers if they are referred, in base 10^2.
    uint256 buyerReward;
    // Token Image URI
    string resourceUri;
    // Metadata name
    string resourceName;
  }

  // the NFTs that are being sold on Wagmi.
  uint256 listingId = 0;

  // index (listingId) => Listing
  Listing[] listings;

  // the set of registered promoters. mapping used for O(1) access.
  mapping(address => bool) promoters;

  event NewListing(uint256 _listingId);
  event BoughtListing(uint256 _listingId);

  /**
   * Gives WagmiContract the authority to manage the owner's NFT.
   * @param _tokenAddr address of the NFT contract.
   * @param _tokenId id of the token on the NFT contract.
   */
  function approveWagmi(address _tokenAddr, uint256 _tokenId) internal {
    require(
      IERC721(_tokenAddr).ownerOf(_tokenId) == msg.sender,
      "Token is not owned by caller"
    );
    IERC721(_tokenAddr).approve(address(this), _tokenId);
  }

  /**
   * Gets all the listings on the platform
   * TODO: Limit listings
   */
  function getListings() external view returns (Listing[] memory) {
    return listings;
  }

  /**
   * Lists an NFT on the Wagmi marketplace.
   * @param _tokenAddr address of the NFT contract.
   * @param _tokenId id of the token on the NFT contract.
   * @param _listPrice price of the NFT to be sold at.
   * @param _promoterReward commission given to promoters for referring people.
   * @param _buyerReward discount given to buyers if they are referred.
   * todo: ensure that msg.sender is owner of NFT.
   */
  function listNFT(
    address _tokenAddr,
    uint256 _tokenId,
    uint256 _listPrice,
    uint256 _promoterReward,
    uint256 _buyerReward
  ) external payable returns (uint256) {
    uint256 expectedDeposit = _listPrice
      .mul(_promoterReward.add(_buyerReward))
      .div(100);
    require(msg.value == expectedDeposit, "Expected deposit is wrong");
    listings.push(
      Listing({
        id: listingId,
        exists: true,
        tokenAddr: _tokenAddr,
        tokenId: _tokenId,
        ownerAddr: msg.sender,
        listPrice: _listPrice,
        promoterReward: _promoterReward,
        buyerReward: _buyerReward,
        resourceUri: ERC721(_tokenAddr).tokenURI(_tokenId),
        resourceName: ERC721(_tokenAddr).name()
      })
    );

    approveWagmi(_tokenAddr, _tokenId);
    emit NewListing(listingId);
    return listingId++;
  }

  /**
   * Retrieves the information of a listing on the Wagmi marketplace.
   * @param _listingId id of the listing.
   * @return the information of the listing.
   */
  function getListing(uint256 _listingId)
    external
    view
    returns (Listing memory)
  {
    require(_listingId <= listingId, "Invalid listing id");
    require(listings[_listingId].exists == true, "listing does not exist");
    return listings[_listingId];
  }

  /**
   * Delist an NFT from the Wagmi marketplace.
   * @param _listingId id of the listing.
   */
  function removeListing(uint256 _listingId) external {
    require(_listingId <= listingId, "Invalid listing id");
    require(listings[_listingId].exists == true, "listing does not exist");
    delete listings[_listingId];
  }

  /**
   * Allow people to sign up as promoters on the Wagmi marketplace.
   */
  function promoterSignUp() external {
    promoters[msg.sender] = true;
  }

  function isPromoter() external view returns (bool) {
    return promoters[msg.sender];
  }

  /**
   * Purchase an NFT.
   * @param _listingId id of the listing.
   * @param _promoterAddr address of the referrer. the null address (0x0)
   * is used if the NFT is bought without a promoter address.
   */
  function buyNFT(uint256 _listingId, address _promoterAddr)
    external
    payable
    nonReentrant
  {
    require(_listingId <= listingId, "Invalid listing id");

    Listing storage listing = listings[_listingId];
    require(listing.exists, "Listing does not exist anymore");
    require(
      msg.value >= listing.listPrice,
      "Buyer amount is below listed price"
    );

    address tokenOperator = IERC721(listing.tokenAddr).getApproved(
      listing.tokenId
    );
    require(
      tokenOperator == address(this),
      "Contract is not approved to send NFT"
    );

    // Transfer commission
    if (_promoterAddr != address(0)) {
      uint256 promoterRewardFee = listing
        .promoterReward
        .mul(listing.listPrice)
        .div(100);
      uint256 buyerRewardFee = listing.buyerReward.mul(listing.buyerReward).div(
        100
      );

      payable(_promoterAddr).transfer(promoterRewardFee);
      (bool success, ) = msg.sender.call{value: buyerRewardFee}("");
      require(success, "Sending reward to buyer failed");
    }

    // TODO: Replace with safeTransferFrom by checking ERC721Receiver implementer
    IERC721(listing.tokenAddr).transferFrom(
      listing.ownerAddr,
      msg.sender,
      listing.tokenId
    );
    payable(listing.ownerAddr).transfer(listing.listPrice);

    emit BoughtListing(_listingId);
  }
}
