import React, { Component } from "react";
import connectWeb3 from "./connectWeb3";
import {HashRouter,Routes,Route} from "react-router-dom";
import Navigation from './Navbar/header.js';
import Footer from './Footer'; 
import Home from './pages/Home.js';
import Create from './pages/Create.js';
import MyListedItems from './pages/MyListedItems.js';
import MyPurchases from './pages/MyPurchases.js';
import Person from './pages/Person.js';
import { Spinner } from 'react-bootstrap';
import MarketplaceContract from '../contracts/Marketplace.json';
import NFTContract from '../contracts/NFT.json';

import "../assets/styles/App.css";

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading:false,
      account:"",
      nft:null,
      marketplace:null,
      web3:null
    }
  }

  async componentDidMount() {
    const user = sessionStorage.getItem("user");
    
    if(user) {
      this.setState({account:user});
      this.web3Handler();
    }
  }

  // 连接MetaMask
  async web3Handler() {
    this.setState({
      loading:true
    });

    try {
      // 获取网络提供商和web3实例
      const web3 = await connectWeb3();

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

      sessionStorage.setItem("user", accounts[0]);

    } catch (error) {
      alert('Failed to load web3, accounts, or contract. Check console for details.');
      console.error(error);
    }
  }


  render() {
    let account     = this.state.account;
    let web3Handler = this.web3Handler.bind(this);
    let marketplace = this.state.marketplace;
    let nft         = this.state.nft;
    let web3        = this.state.web3;

    return (
      <HashRouter>
        <div className="App">
          <div className="headerNavbar">
            <Navigation web3Handler={web3Handler} account={account} />
          </div>
          <div>
            {this.state.loading ? 
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Spinner animation="border" style={{ display: 'flex' }} />
                <p className='mx-3 my-0'>Loading...</p>
              </div> :
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
            }
          </div>
          <div>
            <Footer />
          </div>
        </div>
        {account === "" ? 
          <div className="loginPage">
            <div className="bg"></div>
            <button type='button' className="btn-connectWallet" onClick={()=>{web3Handler()}}>Connect Wallet</button>
          </div> : ""
        }
      </HashRouter>
    );
  }
}

export default App;
