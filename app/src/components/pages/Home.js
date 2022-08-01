import React,{ Component } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading:true,
      items:[]
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.account === prevProps.account) return;
    this.loadMarketplaceItems(this.props);
  }

  componentDidMount() {
    if(this.props.account) {
      this.loadMarketplaceItems(this.props);
    }
  }

  componentWillUnmount() {

  }

  async loadMarketplaceItems(props) {
    const marketplace = props.marketplace;
    const nft         = props.nft;
    const web3        = this.props.web3;

    if(!marketplace._address || !nft._address) return;

    const itemCount = await marketplace.methods.itemCount().call();
    let items = [];

    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.methods.items(i).call();
      
      if (!item.sold) {
        const uri = await nft.methods.tokenURI(item.tokenId).call();
        
        const response = await fetch(uri);
        const metadata = await response.json();

        const totalPrice = await marketplace.methods.getTotalPrice(item.itemId).call();
    
        items.push({
          totalPrice:web3.utils.fromWei(totalPrice,'Ether'),
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: this.resolveLink(metadata.image)
        })
      }
    }

    this.setState({
      loading:false,
      items:items
    });
  }

  async buyMarketItem(item) {
    const marketplace = this.props.marketplace;
    const account     = this.props.account;
    const web3        = this.props.web3;
    
    if(!marketplace._address || !account) return;

    await marketplace.methods.purchaseItem(item.itemId).send({from:account,value: web3.utils.toWei(item.totalPrice,'Ether')});
    
    this.loadMarketplaceItems(this.props);
  }

  resolveLink(url) {
    if(!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://","https://nftstorage.link/ipfs/");
  }

  render() {
    let items = this.state.items;
    let buyMarketItem = this.buyMarketItem.bind(this);

    return (
      <div className="flex justify-center">
        
        {items.length > 0 ?

          <div className="container cardContain">
            <Row xs={1} md={2} lg={4} className="rowContain">

              {items.map((item, idx) => (

                <Col key={idx} className="overflow-hidden colItem">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        {item.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button className="btn-buy" onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                          Buy for {item.totalPrice} ETH
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              
              ))}

            </Row>
          </div>
        
        : (

          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        
        )}

      </div>
    );
  }
}

export default Home;