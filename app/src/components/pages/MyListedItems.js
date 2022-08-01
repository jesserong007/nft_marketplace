import React,{ Component } from 'react';
import { Row, Col, Card } from 'react-bootstrap';

class MyListedItems extends Component {
  
  componentDidMount() {
    if(this.props.account) {
      this.loadListedItems(this.props);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.account === prevProps.account) return;
    this.loadListedItems(this.props);
  }

  constructor(props) {
    super(props)
    this.state = {
      loading:true,
      listedItems:[],
      soldItems:[]
    }
  }

  renderSoldItems(items) {
    return (
      <>
        <h3>Sold</h3>
        <Row xs={1} md={2} lg={4} className="rowContain">
          {items.map((item, idx) => (
            <Col key={idx} className="overflow-hidden colItem">
              <Card>
                <Card.Img variant="top" src={item.image} />
                <Card.Footer>
                  For {item.totalPrice} ETH - Recieved {item.price} ETH
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    )
  }

  async loadListedItems(props) {
    const marketplace = props.marketplace;
    const nft         = props.nft;
    const account     = props.account;
    const web3        = props.web3;

    if(!marketplace._address || !nft._address || !account) return;

    const itemCount = await marketplace.methods.itemCount().call();
    let listedItems = [];
    let soldItems   = [];

    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.methods.items(indx).call();

      if (i.seller.toLowerCase() === account.toLowerCase()) {
        //根据tokenId获取uri
        const uri = await nft.methods.tokenURI(i.tokenId).call();
        //获取数据
        const response = await fetch(uri);
        const metadata = await response.json();
        //获取总价
        const totalPrice = await marketplace.methods.getTotalPrice(i.itemId).call();

        let item = {
          totalPrice:web3.utils.fromWei(totalPrice,'Ether'),
          price: web3.utils.fromWei(i.price,'Ether'),
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: this.resolveLink(metadata.image)
        }

        listedItems.push(item);

        //已出售的nft列表
        if(i.sold) soldItems.push(item);
      }
    }

    this.setState({
      loading:false,
      listedItems:listedItems,
      soldItems:soldItems
    });
  }

  resolveLink(url) {
    if(!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://","https://nftstorage.link/ipfs/");
  }

  render() {
    let renderSoldItems = this.renderSoldItems;
    let listedItems     = this.state.listedItems;
    let soldItems       = this.state.soldItems;

    if(this.state.loading) {
      return (
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
      )
    }

    return (
      <div className="flex justify-center">
        
        {listedItems.length > 0 ?
          
          <div className="container cardContain">
            <h3>Listed</h3>
            <Row xs={1} md={2} lg={4} className="rowContain">

              {listedItems.map((item, idx) => (
                
                <Col key={idx} className="overflow-hidden colItem">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Footer>{item.totalPrice} ETH</Card.Footer>
                  </Card>
                </Col>
              
              ))}

            </Row>

            {soldItems.length > 0 && renderSoldItems(soldItems)}
          
          </div>

        : (
          
          <main style={{ padding: "1rem 0" }}>
            <h4>No listed assets</h4>
          </main>
          
        )}

      </div>
    );
  }
}

export default MyListedItems;