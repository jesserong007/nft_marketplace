import React,{ Component } from 'react';
import { Navbar, Container } from 'react-bootstrap';
import market from '../../assets/images/market.png';

class Header extends Component {
    
    render() {
        return (
            <Navbar expand="lg" bg="secondary" variant="dark">
                <Container>
                    <Navbar.Brand>
                        <img src={market} width="40" height="40" className="" alt="" />
                        <span className="appName">NFT Marketplace</span>
                    </Navbar.Brand>
                </Container>
            </Navbar>
        );
    }
}

export default Header;