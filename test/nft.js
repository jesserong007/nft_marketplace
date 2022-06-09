const nft = artifacts.require("./NFT.sol");
const marketplace = artifacts.require("./Marketplace.sol");

contract("NFT", accounts => {
  it("test nft.", async () => {
    const nftInstance = await nft.deployed();
    const marketplaceInstance = await marketplace.deployed();

    let a = await nftInstance.mint("http://baidu.com");

    const id = await nftInstance.tokenCount();

    assert.equal(id, 1, "The id is true.");

    await nftInstance.setApprovalForAll(marketplaceInstance.address, true);

    await marketplaceInstance.makeItem(nftInstance.address, id, 10);
  });
});
