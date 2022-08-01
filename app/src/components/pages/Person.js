import {Link} from "react-router-dom";
import React,{ Component } from 'react';
import { Nav } from 'react-bootstrap';
import touxiang from '../../assets/images/touxiang.png';

class Person extends Component {
    
    render() {
        let web3Handler = this.props.web3Handler;
        let account     = this.props.account;

        return (
            <div>
                <div className="myhead">
                    <img className="touxiang" src={touxiang} alt="" />
                    {account ? (
                        <p className="txt">
                            <Nav.Link
                                href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link">
                                {account.slice(0, 5) + '...' + account.slice(38, 42)}
                            </Nav.Link>
                        </p>
                    ) : (
                        <p className="txt" onClick={() => { web3Handler() }}>
                            Connect Wallet
                        </p>
                    )}
                </div>
                <div className="itemList">
                    <div className="item">
                        <Nav.Link className="link" as={Link} to="/my-listed-items">
                            My Listed Items
                        </Nav.Link>
                    </div>
                    <div className="item">
                        <Nav.Link className="link" as={Link} to="/my-purchases">
                            My Purchases
                        </Nav.Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Person;