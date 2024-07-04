import React, { Component } from 'react';
import './Wallet.css';
import purse from '../images/piggy.png'

class Wallet extends Component {
    render() {
        const { wallet } = this.props;
        return (
            <div className="wallet">
                <img src={purse} alt="purse" className="wallet__image" style={{ height: 210, width: 230 }} />
                <p className="wallet__text">
                    <br />
                    <span className="wallet__sum">{wallet}0</span>
                    <br /> COINS SAVED
                </p>
            </div>
        );
    }
}

export default Wallet;
