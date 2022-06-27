import React,{ Component } from 'react';
import Ipfs from './Ipfs';
import Nftstorage from './Nftstorage';
import Web3storage from './Web3storage';

class Create extends Component {

  constructor(props) {
    super(props)

    this.state = {
      uploadMethod:2  //1为IPFS, 2为Web3Storage, 3为NFTStorage
    }
  }

  render() {
    const marketplace     = this.props.marketplace;
    const nft             = this.props.nft;
    const web3            = this.props.web3;
    const account         = this.props.account;
    const uploadMethod    = this.state.uploadMethod;
    let content           = '';

    switch(uploadMethod) {
      case 1:
        content = <Ipfs marketplace={marketplace} nft={nft} web3={web3} account={account} />
      break;
      case 2:
        content = <Web3storage marketplace={marketplace} nft={nft} web3={web3} account={account} />
      break;
      case 3:
        content = <Nftstorage marketplace={marketplace} nft={nft} web3={web3} account={account} />
      break;
      default:
        content = <Ipfs marketplace={marketplace} nft={nft} web3={web3} account={account} />
      break;
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
            {content}
          </main>
        </div>
      </div>
    );
  }
}

export default Create;