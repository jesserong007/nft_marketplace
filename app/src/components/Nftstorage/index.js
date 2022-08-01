import React,{ Component } from 'react';
import { Row, Form, Button } from 'react-bootstrap';
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js';

class Nftstorage extends Component {

  componentDidMount() {
    this.getIpfsClient();
  }

  constructor(props) {
    super(props)

    this.state = {
      image:null,
      price:null,
      name:'',
      description:'',
      client:null
    }
  }

  // 获取IpfsClient对象
  getIpfsClient() {
    const nft_storage_token = process.env.REACT_APP_NFT_STORAGE_TOKEN;

    if(!nft_storage_token) {
      return console.error('A token is needed. You can create one on https://nft.storage');
    }

    const client = new NFTStorage({ token: nft_storage_token });
     
    
    this.setState({
      client:client
    });
  }

  // 将NFT上传到NFTStorage(IPFS + Filecoin)
  async uploadFileToNFTStorage(file,name,description,price) {
    const client   = this.state.client;

    if (typeof file == 'undefined' || !file || !name || !description) {
      console.error('image error!');
      return false;
    }

    return client.store({
      image:file,
      name:name,
      description:description,
      price:price
    });
  }

  //将简单文档上传到NFTStorage(IPFS + Filecoin)
  async storeBlobToNFTStorage(txt) {
    const client   = this.state.client;

    if(!client || !txt) {
      console.error('image error!');
      return false;
    }

    const someData = new Blob([txt]);
    const cid      = await client.storeBlob(someData);

    if(!cid) {
      console.error('cid error!');
      return false;
    }

    return cid;
  }

  // 添加NFT上传到IPFS
  async createNFT() {
    let image           = document.getElementById("fileImage").files[0];
    let price           = this.state.price;
    let name            = this.state.name;
    let description     = this.state.description;
    const client        = this.state.client;

    if(!image || !price || !name || !description || !client) return false;

    try {
      const result = await this.uploadFileToNFTStorage(image,name,description,price);
      console.log(result);
      const cid    = result.ipnft;

      const uri   = `https://nftstorage.link/ipfs/${cid}/metadata.json`;
      console.log(uri);
      if(!uri) {
        console.error('uri error!');
        return false;
      }

      await this.mintThenList(uri);

    } catch(error) {
      console.log("ipfs uri upload error: ", error);
    }
  }

  // 花费ETH将NFT添加到Marketplace
  async mintThenList(uri) {
    const web3        = this.props.web3;
    const marketplace = this.props.marketplace;
    const nft         = this.props.nft;
    const account     = this.props.account;
    let price         = this.state.price;
    
    // 生成NFT
    await nft.methods.mint(uri).send({from:account});
    
    // 获取NFT的tokenId 
    const id = await nft.methods.tokenCount().call();

    // 批准Marketplace花费NFT
    await nft.methods.setApprovalForAll(marketplace._address, true).send({from:account});
    
    const listingPrice = web3.utils.toWei(price.toString(),'Ether');
    
    // 添加NFT到Marketplace
    await marketplace.methods.makeItem(nft._address, id, listingPrice).send({from:account});
  }

  setName(name) {
    this.setState({
      name:name
    });
  }

  setDescription(description) {
    this.setState({
      description:description
    });
  }

  setPrice(price) {
    this.setState({
      price:price
    });
  }

  render() {
    let setName         = this.setName.bind(this);
    let setDescription  = this.setDescription.bind(this);
    let setPrice        = this.setPrice.bind(this);
    let createNFT       = this.createNFT.bind(this);

    return (
      <div className="content mx-auto">
        <Row className="g-4">
          <Form.Control
            type="file"
            required
            name="file"
            id="fileImage"
          />
          <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
          <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
          <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
          <div className="d-grid px-0">
            <Button onClick={createNFT} variant="primary" size="lg">
              Create & List NFT!
            </Button>
          </div>
        </Row>
      </div>
    );
  }
}

export default Nftstorage;