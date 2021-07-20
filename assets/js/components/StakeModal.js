import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { mapStoreToProps, mapDispatchToProps, components } from '../../store/storeToProps';
import { withTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import extRequests from '../requests/extRequests';
import ValueProcessor from '../utils/ValueProcessor';
import FarmValidationRules from '../utils/dropFarmsValidationRules/StakeUnstakeValidationRules';
import Validator from  '../utils/Validator';

import '../../css/confirm-supply.css';

const valueProcessor = new ValueProcessor();

class StakeModal extends React.Component {
    constructor(props) {
      super(props);

      this.handleInputChange = this.handleInputChange.bind(this);
      this.valueProcessor = new ValueProcessor;
      this.modifyStakeRanges = {
          ranges : [
              {
                  value : 25,
                  alias : '25%'
              },
              {
                  value : 50,
                  alias : '50%'
              },
              {
                  value : 75,
                  alias : '75%'
              },
              {
                  value : 100,
                  alias : 'MAX'
              }
          ]
      };
    }

    closeModal () {
        this.props.updShowStakeModal({
            value : false
        });
        this.props.updateStakeData({
          field : 'stakeValue',
          value : 0
        });        
    };

    sendIssueTokenTx() {
        return true;
    }

    handleInputChange(event) {
      const target = event.target;
      let value = target.value;
      this.processData(value);
    }

    doAction() {
      let value = this.props.stakeData.stakeValue.numberValue
      this.processData(value, 'sendTx');
    }

    processData(value, purpose = '') { //if purpose == 'sendTx' will send stake/unstake transaction
      let paramsForValidation = {
        mainToken            : this.props.mainToken,
        stakeTokenAmount     : BigInt(this.props.stakeData.stakeTokenAmount),
        stakeValue           : {
                                  numberValue : value
                                },
        mainTokenAmount      : BigInt(this.props.mainTokenAmount),
        actionCost           : BigInt(this.props.stakeData.actionCost),
        stake_token_decimals : this.props.managedFarmData.stake_token_decimals,
        stake_token_hash     : this.props.managedFarmData.stake_token_hash,
      }

      let validationRules = new FarmValidationRules(this.props.t)
      let validator = new Validator;
      let commonValidationRules = validationRules.getCommonValidationRules(this.props.currentAction, paramsForValidation);
      let commonCheck = validator.batchValidate(paramsForValidation, commonValidationRules);
      let dataValid = commonCheck.dataValid;

      this.props.updateStakeData({
          field : 'msgData',
          value : commonCheck.propsArr
      });

      if (commonCheck.dataValid) {
        let bigIntValue = this.valueProcessor.valueToBigInt(value, this.props.managedFarmData.stake_token_decimals);
        paramsForValidation.stakeValue.bigIntValue = bigIntValue.value;
        paramsForValidation.stakeValue.rawFractionalPart = bigIntValue.rawFractionalPart;
        let specialValidationRules = validationRules.getSpecialValidationRules(this.props.currentAction, paramsForValidation);
        let validatonResult = validator.batchValidate(paramsForValidation, specialValidationRules);
        dataValid = validatonResult.dataValid;
        this.props.updateStakeData({
            field : 'msgData',
            value : validatonResult.propsArr
        });
        this.props.updateStakeData({
          field : 'stakeValue',
          value : paramsForValidation.stakeValue
        });
      }

      this.props.updateStakeData({
        field : 'stakeValid',
        value : dataValid
      });

      if (purpose === 'sendTx') {
        let obj = {
          farm_id : this.props.managedFarmData.farm_id,
          amount : paramsForValidation.stakeValue.bigIntValue
        }

        extRequests.farmAction(this.props.pubkey, this.props.currentAction, obj)        
        .then(result => {
            console.log(obj)
            console.log('Success', result.hash);
            this.closeModal();
            //this.props.updCurrentTxHash(result.hash);
            // this.props.changeWaitingStateType('submitted');
            // this.props.resetStore();
        },
        error => {
            console.log('Error')
            this.props.changeWaitingStateType('rejected');
        });
      }

    }

    render() {
        const t = this.props.t;

        return (

            <>
                <Modal
                    show={this.props.showStakeModal}
                    aria-labelledby="example-custom-modal-styling-title"
                    onHide={this.closeModal.bind(this)}
                    centered 
                    animation={false}>
                    <Modal.Header closeButton className="mb-0 pb-0">
                        <Modal.Title id="example-custom-modal-styling-title">
                            <div className="d-flex align-items-center justify-content-start">
                                <span>
                                    {t('dropFarms.stakeLPTokens')}
                                </span>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="stake-input-area px-3 py-3 mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>{t('dropFarms.stake')}</div>
                                <div className="d-flex flex-nowrap">
                                    <div className="mr-2">{t('balance')}:</div>
                                    <div>{(this.props.stakeData.stakeTokenAmount !== null && this.props.stakeData.stakeTokenAmount !== undefined) ? valueProcessor.usCommasBigIntDecimals(this.props.stakeData.stakeTokenAmount, this.props.managedFarmData.stake_token_decimals) + ' ' + this.props.managedFarmData.stake_token_name : '---'} </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <Form.Control
                                  type="text"
                                  placeholder="0"
                                  className="mr-4 stake-input"
                                  onChange={this.handleInputChange.bind(this)}
                                  autoFocus/>
                                <div className="d-flex flex-nowrap">
                                    <div className="mr-2 set-max text-color3 hover-pointer">{t('max')}</div>
                                    <div className="text-nowrap">{this.props.managedFarmData !== null ? this.props.managedFarmData.stake_token_name : '---'} LP</div>
                                </div>
                            </div>                                                         
                        </div>

                        <div className={`err-msg mb-4 ${this.props.stakeData.stakeValid ? 'd-none' : 'd-block'}`}>
                            {this.props.stakeData.stakeValidationMsg}
                        </div>                        

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            {this.modifyStakeRanges.ranges.map((item, index) => (
                                <button key={index+''} className="btn btn-secondary px-3 py-1 text-color4" >{item.alias}</button>
                            ))}
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <Button className='btn-secondary confirm-supply-button w-100 mr-2'
                                    onClick={this.closeModal.bind(this)}>
                                {t('cancel')}
                            </Button>
                            <Button className='btn-secondary confirm-supply-button w-100 ml-2'
                                    disabled={!this.props.stakeData.stakeValid}
                                    onClick={this.doAction.bind(this)}>
                                {t('confirm')}
                            </Button>                        
                        </div>
 
                        <div className="text-center ">
                            <a
                                href = "/"
                                className="text-color4-link hover-pointer">
                                <span className="mr-2">{t('dropFarms.getLPToken', {tokenName : 'CAKE-BNB'})}</span>
                                <span className="icon-Icon11"/>                                
                            </a>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        );
    };
};

const WStakeModal = connect(mapStoreToProps(components.FARMS), mapDispatchToProps(components.FARMS))(withTranslation()(StakeModal));

export default WStakeModal;