import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Navigation from './Navbar';
import Footer from './Footer.js';
import Home from './Home.js';
import Create from './Create.js';
import MyListedItems from './MyListedItems.js';
import MyPurchases from './MyPurchases.js';
import Person from './Person.js';
import { Spinner } from 'react-bootstrap';
import MarketplaceContract from '../contracts/Marketplace.json';
import NFTContract from '../contracts/NFT.json';

import "./App.css";

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading:true,
      account:null,
      nft:{},
      marketplace:{},
      web3:{}
    }
  }

  async componentDidMount() {
    this.web3Handler();
  }

  // 连接MetaMask
  async web3Handler() {
    try {
      // 获取网络提供商和web3实例
      const web3 = await getWeb3();

      // 获取用户的帐户
      //const accounts  = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);

      // 获取网络ID
      const networkId = await web3.eth.net.getId();

      // 网络更换
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      })

      // 帐户更换
      window.ethereum.on('accountsChanged', async function (accounts0) {
        window.location.reload();
      })

      // 获取合约实例
      const marketplaceDeployedNetwork     = MarketplaceContract.networks[networkId];
      const nftDeployedNetwork             = NFTContract.networks[networkId];
    
      const marketplaceInstance = new web3.eth.Contract(MarketplaceContract.abi,marketplaceDeployedNetwork.address);
      const nftInstance         = new web3.eth.Contract(NFTContract.abi,nftDeployedNetwork.address);

      this.setState({
        marketplace:marketplaceInstance,
        nft:nftInstance,
        account:accounts[0],
        web3:web3,
        loading:false
      })

    } catch (error) {
      alert('Failed to load web3, accounts, or contract. Check console for details.');
      console.error(error);
    }
  }

  render() {
    let account     = this.state.account;
    let web3Handler = this.web3Handler;
    let marketplace = this.state.marketplace;
    let nft         = this.state.nft;
    let web3        = this.state.web3;

    let content = (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spinner animation="border" style={{ display: 'flex' }} />
        <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
      </div>
    );

    if(!this.state.loading) {
      content = (
        <Routes>
          <Route path="/" element={
            <Home marketplace={marketplace} nft={nft} web3={web3} account={account} />
          } />
          <Route path="/create" element={
            <Create marketplace={marketplace} nft={nft} web3={web3} account={account} />
          } />
          <Route path="/my-listed-items" element={
            <MyListedItems marketplace={marketplace} nft={nft} web3={web3} account={account} />
          } />
          <Route path="/my-purchases" element={
            <MyPurchases marketplace={marketplace} nft={nft} web3={web3} account={account} />
          } />
          <Route path="/person" element={
            <Person web3Handler={web3Handler} account={account} />
          } />
        </Routes>
      );
    }

    return (
      <BrowserRouter>
        <div className="App">
          <div className="headerNavbar">
            <Navigation />
          </div>
          <div>
            {content}
          </div>
          <div>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
