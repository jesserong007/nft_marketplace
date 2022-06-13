import React,{ Component } from 'react';
import { Row, Form, Button } from 'react-bootstrap';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js';
import config from '../config.js';

class Create extends Component {

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
      client:null,
      uploadMethod:2  //1为IPFS, 2为Web3Storage, 3为NFTStorage
    }
  }

  // 获取IpfsClient对象
  getIpfsClient() {
    const uploadMethod  = this.state.uploadMethod;
    let client          = null;
    
    switch(uploadMethod) {
      case 1:
        client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
      break;
      case 2:
        const web3_storage_token = config.web3_storage_token;

        if (!web3_storage_token) {
          return console.error('A token is needed. You can create one on https://web3.storage');
        }

        client = new Web3Storage({ token:web3_storage_token });
      break;
      case 3:
        const nft_storage_token = config.nft_storage_token;

        if(!nft_storage_token) {
          return console.error('A token is needed. You can create one on https://nft.storage');
        }

        client = new NFTStorage({ token: nft_storage_token });
      break;
      default:
        client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
      break;
    }
    
    this.setState({
      client:client
    });
  }

  // 将NFT上传到NFTStorage(IPFS + Filecoin)
  async uploadFileToNFTStorage(image,filename,description) {
      const client   = this.state.client;

      if (typeof image == 'undefined' || !image || !filename || !description) {
        console.error('image error!');
        return false;
      }

      return client.store({
        image:image,
        name:filename,
        description:description
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

  // 将文件上传到web3Storage(IPFS + Filecoin)
  async uploadFileToWeb3Storage(file) {
    const client = this.state.client;

    if(!file) {
      console.error('file error!');
      return false;
    }

    const files = [];
    files.push(file);

    const cid = await client.put(files);

    if(!cid) {
      console.error('upload fail , cid error');
      return false;
    }

    return cid;
  }

  // 将文件上传到IPFS
  async uploadToIPFS(event) {
    event.preventDefault();
    const uploadMethod  = this.state.uploadMethod;
    const file          = event.target.files[0];
    let image           = '';
    let cid             = '';

    if(!uploadMethod || !file || typeof file == 'undefined') {
      console.error('file error!');
      return false;
    }

    switch(uploadMethod) {
      case 1:
        cid       = await this.uploadFileToIPFS(file);
        image     = `https://ipfs.infura.io/ipfs/${cid}`;
      break;
      case 2:
        cid       = await this.uploadFileToWeb3Storage(file);
        image     = `https://${cid}.ipfs.dweb.link/${file.name}`;
      break;
      case 3:
        let result = await this.uploadFileToNFTStorage(file,file.name,file.name);
        console.log(result);
        cid        = result.ipnft;
        image      = `https://nftstorage.link/ipfs/${cid}`;
      break;
      default:
        cid       = await this.uploadFileToIPFS(file);
        image     = `https://ipfs.infura.io/ipfs/${cid}`;
      break;
    }

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
    const uploadMethod  = this.state.uploadMethod;

    if(!image || !price || !name || !description || !client || !uploadMethod) return false;

    // 构造一个json文件
    let  filename = name + ".json";
    let  data     = JSON.stringify({image, price, name, description});

    // 创建一个 blob 数据
    let blob = new Blob([data],{type:"text/json"});
    let file = new File([blob],filename);

    try {
      let uri = '';
      let cid = '';

      switch(uploadMethod) {
        case 1:
          cid   = await this.uploadFileToIPFS(file);
          uri   = `https://ipfs.infura.io/ipfs/${cid}`;
        break;
        case 2:
          cid   = await this.uploadFileToWeb3Storage(file);
          uri   = `https://${cid}.ipfs.dweb.link/${file.name}`;
        break;
        case 3:
          cid   = await this.storeBlobToNFTStorage(data);
          uri   = `https://nftstorage.link/ipfs/${cid}`;
        break;
        default:
          cid   = await this.uploadFileToIPFS(file);
          uri   = `https://ipfs.infura.io/ipfs/${cid}`;
        break;
      }
      
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
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
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
          </main>
        </div>
      </div>
    );
  }
}

export default Create;