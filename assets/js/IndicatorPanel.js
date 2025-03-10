import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ExtRequests from './extRequests';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';
const extRequests = new ExtRequests();

class IndicatorPanel extends React.Component {
    constructor (props) {
        super(props);
        this.networks = {
            bit : {
                name : 'BIT',
                action : undefined
            }
        };
        this.netsOrder = ['bit'];
        this.updData();
    };

    renderWalletInfo() {
        return (
            <div className='wallet-info-wrapper d-flex align-items-center justify-content-end'>
                <div id="pendingIndicator" className="d-flex align-items-center justify-content-end px-3 mr-3">
                    <span className="mr-2">Pending</span>
                    <span className="spinner icon-Icon3"></span>
                </div>
                <div className='net wallet-info-boxes d-flex align-items-center justify-content-center mr-3'>
                    <Dropdown alignRight >
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className="choose-net">
                            <span className='text-uppercase'>{this.networks[this.props.net.toLowerCase()].name}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="wrapper-1">
                            {this.netsOrder.map((item, index) => (
                                <Dropdown.Item className="text-center py-2 net-item" key={index} value={index}>{this.networks[item].name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className='enx-amount wallet-info-boxes d-flex align-items-center justify-content-center px-3 border-0 mr-3'>
                    {this.props.enx} ENX
                </div>
                <div className='wallet-info-boxes d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center justify-content-center px-3'>{this.props.coinAmount} {this.props.coinName}</div>
                    <div className='addr wallet-info-boxes d-flex align-items-center justify-content-center'>{this.packAdressString(this.props.pubkey)}</div>
                </div>
            </div>
        );
    };

    updData() {
        setInterval(async () => {
            extRequests.getBalance(this.props.nativeToken)
            .then(balance => {
                if (balance !== undefined)
                    this.props.updCoinAmount(balance.amount);
            });
        }, 1000);
    };

    packAdressString(addr) {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    render () {
        return this.renderWalletInfo();
    };
};

const WIndicatorPanel = connect(mapStoreToProps(components.INDICATOR_PANEL), mapDispatchToProps(components.INDICATOR_PANEL))(IndicatorPanel);

export default WIndicatorPanel;