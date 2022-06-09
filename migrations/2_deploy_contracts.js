const Marketplace = artifacts.require("Marketplace");
const NFT = artifacts.require("NFT");

module.exports = async function(deployer,network,accounts) {
	// Deploy Marketplace
	await deployer.deploy(Marketplace,1);
	const marketplace = await Marketplace.deployed();

	// Deploy NFT
  	await deployer.deploy(NFT);
  	const nft = await NFT.deployed();
};