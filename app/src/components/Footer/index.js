import {Link} from "react-router-dom";
import React,{ Component } from 'react';
import { Nav } from 'react-bootstrap';
import home from '../../assets/images/home.png';
import add_image from '../../assets/images/add_image.png';
import person from '../../assets/images/person.png';

class Footer extends Component {
    
    render() {
        return (
            <div className="footer">
                <div className="item">
                    <Nav.Link className="link" as={Link} to="/">
                        <img className="img" src={home} alt="" />
                        <p>Home</p>
                    </Nav.Link>
                </div>
                <div className="item">
                    <Nav.Link className="link" as={Link} to="/create">
                        <img className="img" src={add_image} alt="" />
                        <p>Create</p>
                    </Nav.Link>
                </div>
                <div className="item">
                    <Nav.Link className="link" as={Link} to="/person">
                        <img className="img" src={person} alt="" />
                        <p>Person</p>
                    </Nav.Link>
                </div>
            </div>
        );
    }
}

export default Footer;