import React,{ Component } from 'react';
import { Row, Form, Button } from 'react-bootstrap';
import { create as ipfsHttpClient } from 'ipfs-http-client';

class Ipfs extends Component {

  componentDidMount() {
    this.getIpfsClient();
  }

  constructor(props) {
    super(props)

    this.state = {
      image:'',
      price:null,
      name:'',
      description:'',
      client:null
    }
  }

  // 获取IpfsClient对象
  getIpfsClient() {
    const client        = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
    
    this.setState({
      client:client
    });
  }

  // 将文件上传到IPFS
  async uploadFileToIPFS(file) {
    const client   = this.state.client;

    if (typeof file == 'undefined' || !file) {
      console.error('file error!');
      return false;
    }

    try {
      const result = await client.add(file);
      
      if(!result || !result.path) return false;
      
      return result.path;
      
    } catch (error){
      console.log("ipfs image upload error: ", error);
    }
  }

  // 将文件上传到IPFS
  async uploadToIPFS(event) {
    event.preventDefault();
    const file          = event.target.files[0];

    if(!file || typeof file == 'undefined') {
      console.error('file error!');
      return false;
    }

    let cid       = await this.uploadFileToIPFS(file);
    let image     = `https://ipfs.infura.io/ipfs/${cid}`;

    if(!image) {
      console.error('image path error!');
      return false;
    }

    this.setState({
      image:image
    });
  }

  // 添加NFT上传到IPFS
  async createNFT() {
    let image           = this.state.image;
    let price           = this.state.price;
    let name            = this.state.name;
    let description     = this.state.description;
    const client        = this.state.client;

    if(!image || !price || !name || !description || !client) return false;

    // 构造一个json文件
    let  filename = name + ".json";
    let  data     = JSON.stringify({image, price, name, description});

    // 创建一个 blob 数据
    let blob = new Blob([data],{type:"text/json"});
    let file = new File([blob],filename);

    try {
      const cid   = await this.uploadFileToIPFS(file);
      const uri   = `https://ipfs.infura.io/ipfs/${cid}`;
       
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
    let uploadToIPFS    = this.uploadToIPFS.bind(this);
    let createNFT       = this.createNFT.bind(this);

    return (
      <div className="content mx-auto">
        <Row className="g-4">
          <Form.Control
            type="file"
            required
            name="file"
            onChange={uploadToIPFS}
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

export default Ipfs;