import React,{ Component } from 'react';
import { Row, Col, Card } from 'react-bootstrap';

class MyPurchases extends Component {
  
  componentDidMount() {
    if(this.props.account) {
      this.loadPurchasedItems(this.props);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.account === prevProps.account) return;
    this.loadPurchasedItems(this.props);
  }

  constructor(props) {
    super(props)
    this.state = {
      loading:true,
      purchases:[]
    }
  }

  pushPurchases(purchasesItem) {
    let purchases = this.state.purchases;

    if(purchasesItem) {
      purchases.push(purchasesItem);

      this.setState({
        purchases:purchases
      });
    }
  }

  setLoading(loading) {
    this.setState({
      loading:loading
    });
  }

  async loadPurchasedItems(props) {
    const marketplace = props.marketplace;
    const nft         = props.nft;
    const account     = props.account;
    const web3        = props.web3;
    let pushPurchases = this.pushPurchases.bind(this);
    let setLoading    = this.setLoading.bind(this);

    marketplace.events.Bought({
      filter:{buyer:account},
      fromBlock: 0
    }, async function(error, event) { 
      if(error || !event.returnValues) return;

      const itemId  = event.returnValues.itemId;
      const tokenId = event.returnValues.tokenId;
      const price   = event.returnValues.price;

      if(tokenId && itemId && price) {

        const uri = await nft.methods.tokenURI(tokenId).call();

        const response = await fetch(uri);
        const metadata = await response.json();
      
        const totalPrice = await marketplace.methods.getTotalPrice(itemId).call();

        let purchasedItem = {
          totalPrice:web3.utils.fromWei(totalPrice,'Ether'),
          price: web3.utils.fromWei(price,'Ether'),
          itemId: itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        }
        
        pushPurchases(purchasedItem);
      }
    });

    setLoading(false);
  }

  render() {
    let purchases = this.state.purchases;

    if(this.state.loading) {
      return (
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
      );
    }

    return (
      <div className="flex justify-center">
        
        {purchases.length > 0 ?

          <div className="container cardContain">
            <Row xs={1} md={2} lg={4} className="rowContain">
              {purchases.map((item, idx) => (
                <Col key={idx} className="overflow-hidden colItem">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Footer>{item.price} ETH</Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

        : (

          <main style={{ padding: "1rem 0" }}>
            <h2>No purchases</h2>
          </main>
        
        )}

      </div>
    );
  }
}

export default MyPurchases;