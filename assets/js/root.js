import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';

import "regenerator-runtime/runtime.js";
import 'bootstrap/dist/css/bootstrap.min.css';

// import Navbar from './Navbar';
import Aside from './Aside';
import SwapCard from './SwapCard';
import Switch from './Switch';
import UnknownPage from './UnknownPage';
import ConnectionService from './ConnectionService';
// import CommonToast from './CommonToast';

import presets from '../store/pageDataPresets';
import SwapApi from './swapApi';
import { mapStoreToProps, mapDispatchToProps, components } from '../store/storeToProps';

import store from '../store/store';

const swapApi = new SwapApi();

class Root extends React.Component {
    constructor (props) {
        super(props);
        this.siteLocales = presets.langData.siteLocales;
        this.activeLocale = presets.langData.preferredLocale;
        this.langTitles = presets.langData.langTitles;
        this.updLanguage(this.activeLocale);
    };

    async updLanguage (language) {
        await (await swapApi.getLanguage(language)).json()
        .then(langData => {
                this.activeLocale = language;
                this.props.changeLanguage(langData);
        });
    };

    changeLanguage (language) {
        this.updLanguage(language);
    };

    getBalance (hash) {
        try {
            return Enecuum.balanceOf({
                to : this.pubKey,
                tokenHash : hash
            });
        } catch (err) {
            return new Promise((resolve, reject) => { reject(err) });
        }
    };

    toggleNavbar () {
        if (this.props.navOpened)
            this.props.closeAside();
        else
            this.props.openAside();
    };

    menuViewController () {
        console.log(this.props);
        switch (this.props.menuItem) {
            case 'exchange':
                return (
                    <div className='swap-card' style={{ left : this.props.swapCardLeft}}>
                        <div id='switch' >
                            <Switch />
                        </div>
                        <SwapCard />
                    </div>
                );
            case 'liquidity':
                return (
                    <div className='swap-card' style={{ left : this.props.swapCardLeft}}>
                        <div id='switch' >
                            <Switch />
                        </div>
                        <SwapCard />
                    </div>
                );
            default:
                return (
                    <UnknownPage />
                );
        };
    };

    changeMenuItem (newItem) {
        this.props.changeMenuItem(newItem);
    };

    openConnectionList () {
        this.props.openConList();
    };

    closeConnectionList () {
        this.props.closeConList();
    };

    connectionList () {
        if (this.props.connecionListOpened)
            return (
                <div>
                    <div id='connection-services'>
                        {/* <ConnectionService /> */}
                    </div>
                </div>
            );
    };

    render () {
        return (
            <div className='h-100'>
                {/* <Navbar outer={ this } /> */}
                <main role='main' className='container-fluid h-100 px-0 position-relative'>
                    <div className='row'>
                        <div className='col-12'>
                            {/* <Aside /> */}
                            {this.menuViewController()}
                            {/* {this.connectionList()} */}
                        </div>
                    </div>
                    {/* <div id="toastWrapper" className="position-absolute pt-4">
                        <CommonToast outer={ this }/>
                    </div> */}
                </main>
            </div>
        );
    };
};

const WRoot = connect(mapStoreToProps(components.ROOT), mapDispatchToProps(components.ROOT))(Root);

ReactDOM.render(
    <Provider store={ store }>
        <WRoot />
    </Provider>,
    document.getElementById('root')
);