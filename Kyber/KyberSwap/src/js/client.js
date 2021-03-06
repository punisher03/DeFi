import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { Layout } from "./containers/Layout"
import BLOCKCHAIN_INFO from "../../env"
import constants from "./services/constants"
import { initSession, initParamsGlobal, haltPayment, initAnalytics } from "./actions/globalActions"
import { initParamsExchange } from "./actions/exchangeActions"
import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistor, store } from "./store"
import Modal from 'react-modal';
import * as common from "./utils/common"
import * as validator from "./utils/validators"
import AnalyticFactory from "./services/analytics"
import Web3 from "web3";
import { initLanguage } from "./services/language";


const tokenData =  {
  "ETH": {
      "symbol": "ETH",
      "name": "Ethereum",
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimals": 18,
      "cg_id": "ethereum",
      "gasLimit": "0",
      "sp_limit_order": true,
      "is_quote": true
  },
  "WETH": {
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "address": "0x494dE9b08140206f1931A84098e84DBB195ce595",
      "decimals": 18,
      "cg_id": "weth",
      "priority": true,
      "sp_limit_order": true,
      "is_quote": true
  },
  "KNC": {
      "symbol": "KNC",
      "name": "KyberNetwork",
      "address": "0x5903820acD03cCadaDD36709D7c6B457247e23b7",
      "decimals": 18,
      "cg_id": "kyber-network",
      "priority": true,
      "sp_limit_order": true
  },
  "DAI": {
      "symbol": "DAI",
      "name": "DAI",
      "address": "0x277aa793a197683D2f713bd29f0eD9FeA4aC1248",
      "decimals": 18,
      "cg_id": "dai",
      "gasLimit": "500000",
      "priority": true,
      "sp_limit_order": true,
      "is_quote": true
  },
  "OMG": {
      "symbol": "OMG",
      "name": "OmiseGO",
      "address": "0x414a66178E0CC0dE816d1E87C4d0F6C066a29612",
      "decimals": 18,
      "cg_id": "omisego",
      "priority": true,
      "sp_limit_order": true
  },
  "POLY": {
      "symbol": "POLY",
      "name": "Polymath",
      "address": "0x565c71686f4Ee595FB2aE9088173b43ca36701B7",
      "decimals": 18,
      "cg_id": "polymath-network"
  },
  "SNT": {
      "symbol": "SNT",
      "name": "Status",
      "address": "0x29CB4f4b7d7eDA073751FA8927e92B7baEE44A8B",
      "decimals": 18,
      "cg_id": "status",
      "sp_limit_order": true
  },
  "MANA": {
      "symbol": "MANA",
      "name": "Mana",
      "address": "0xF093d7B35a4cD3cB67ecAF392A2FddEBede13365",
      "decimals": 18,
      "cg_id": "decentraland",
      "priority": true,
      "sp_limit_order": true
  }
}

function getListTokens(network) {
  return new Promise((resolve, reject) => {
    fetch(BLOCKCHAIN_INFO["ropsten"].api_tokens, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      return response.json()
    })
      .then((result) => {
        if (result.success) {
          var now = Math.round(new Date().getTime()/1000)
          var tokens = {}
          result.data.map(val => {
            if (val.listing_time > now) return
            tokens[val.symbol] = val
          })
          resolve(tokens)
        } else {
          var tokens = BLOCKCHAIN_INFO[network].tokens
          resolve(tokens)
        }
      })
      .catch((err) => {
        console.log(err)
        var tokens = BLOCKCHAIN_INFO[network].tokens
        resolve(tokens)
      })
  })
}

function checkInListToken(str, tokens) {

  var listTokens = str.split("_")
  var listPinTokens = []
  //validate tokens
  var symbol
  for (var i = 0; i < listTokens.length; i++) {
    symbol = listTokens[i].toUpperCase()
    if (!tokens[symbol]) {
      return false
    }
    listPinTokens.push(symbol)
  }
  return listPinTokens
}

function initParams(appId) {
  var translate = (...args) => {
    return null
  }

  var widgetParent = document.getElementById(appId)
  var attributeWidget = true
  var query = {}
  var receiveAddr
  var receiveToken
  var receiveAmount
  var callback
  var network
  var paramForwarding
  var signer
  var commissionID
  var products
  var productNames
  var productQtys
  var productImages
  var type
  var pinnedTokens
  var paymentData
  var hint
  var defaultPair
  var theme
  var mode
  var language
  var title

  if (attributeWidget === true || attributeWidget === 'true') {
    for (var i = 0, atts = widgetParent.attributes, n = atts.length, arr = []; i < n; i++) {
      var nodeName = atts[i].nodeName
      if (nodeName.includes('data-widget')) {
        var key = nodeName.replace('data-widget-', '');

        key = common.lineToCamel(key)

        query[key] = atts[i].nodeValue
      }
    }

    // receiveAddr = "0x2a5c6E0Eb76915466C0CE771DCFb6f258a572336"
    // receiveToken = "ETH"
    // receiveAmount = 0.1
    callback = "https://kyberpay-sample.knstats.com/callback"
    network = "matic"
    paramForwarding = true
    signer = "0x2a5c6E0Eb76915466C0CE771DCFb6f258a572336"
    commissionID = "0x2a5c6E0Eb76915466C0CE771DCFb6f258a572336"
    type = "swap"
    pinnedTokens = []
    paymentData = ""
    hint = ""
    defaultPair = "ETH_KNC"
    theme = "theme-emerald"
    mode = "Popup"
    products = [];
    language = "en"
    title = "SWAP TOKENS"
  } else {
    query = common.getQueryParams(window.location.search)
    receiveAddr = common.getParameterByName("receiveAddr")
    receiveToken = common.getParameterByName("receiveToken")
    receiveAmount = common.getParameterByName("receiveAmount");
    callback = common.getParameterByName("callback")
    network = common.getParameterByName("network")
    paramForwarding = common.getParameterByName("paramForwarding")
    signer = common.getParameterByName("signer")
    commissionID = common.getParameterByName("commissionId")
    productNames = common.getMultipleValuesByName("productName")
    productQtys = common.getMultipleValuesByName("productQty")
    productImages = common.getMultipleValuesByName("productImage")
    type = common.getParameterByName("type")
    pinnedTokens = common.getParameterByName("pinnedTokens") || []
    paymentData = common.getParameterByName("paymentData") || ""
    hint = common.getParameterByName("hint") || ""
    defaultPair = common.getParameterByName("defaultPair")
    theme = common.getParameterByName("theme") || "theme-emerald"
    mode = common.getParameterByName("mode")
    products = productNames ? common.getProductsFromParam(productNames, productQtys, productImages) : [];
    language = common.getParameterByName("lang") || 'en'
    title = common.getParameterByName("title")
  }

  initLanguage(language, store);

  paramForwarding = paramForwarding === "true" || paramForwarding === true ? paramForwarding : "false"
  switch (network) {
    case "production":
    case "mainnet":
      network = "production"
      break
    case "rinkeby":
      network = "rinkeby"
      break
    case "staging":
      network = "staging"
      break
    case "matic":
      network = "matic"
      break
    default:
      network = "ropsten"
      break
  }

  getListTokens(network).then(tokens => {
    console.log("Tokens", tokens)
    console.log(network)
    console.log(BLOCKCHAIN_INFO)
    query.appId = appId
    query.mode = mode;
    store.dispatch(initParamsGlobal(query))

    var errors = {}
    var defaultPairArr = []

    switch (type) {
      case "swap":
        type = "swap"
        if (receiveAddr) {
          errors["receiveAddr"] = "Swap layout cannot include receiveAddr"
        }
        if (receiveToken) {
          errors["receiveToken"] = "Swap layout cannot include receiveToken"
        }
        if (defaultPair) {
          var listDefault = checkInListToken(defaultPair, tokenData)
          if (listDefault === false) {
            errors["defaultPair"] = "Default pair includes invalid token"
          } else {
            if (listDefault.length !== 2) {
              errors["defaultPair_length"] = "Default pair includes more than 2 tokens"
              break;
            }
            if (listDefault[0] === listDefault[1]) {
              errors["defaultPair_pair"] = "2 tokens in default pair must be different"
              break;
            }
            defaultPairArr.push(listDefault[0])
            defaultPairArr.push(listDefault[1])
          }
        }
        break;
      case "buy":
        type = "buy"
        if (receiveAddr) {
          errors["receiveAddr"] = "Buy token layout cannot include receiveAddr"
        }
        if (receiveToken) {
          receiveToken = receiveToken.toUpperCase()
          if (!tokenData[receiveToken]) {
            errors["receiveToken"] = translate('error.receive_token_is_not_support')
              || "Receive token is not supported by kyber"
          }
        } else {
          errors["receiveToken"] = "Buy token layout must include receiveToken"
        }
        break
      default:
        type = "pay"
        if (receiveAddr) {
          if (validator.verifyAccount(receiveAddr)) {
            errors["receiveAddr"] = translate('error.receive_address_must_be_ethereum_addr')
              || "Receive address must be a valid ethereum address"
          }
        } else {
          errors["receiveAddr"] = "Payment layout must include receiveAddr"
        }

        if (receiveToken) {
          receiveToken = receiveToken.toUpperCase()
          if (!tokenData[receiveToken]) {
            errors["receiveToken"] = translate('error.receive_token_is_not_support')
              || "Receive token is not supported by kyber"
          }
        }

        break
    }

    var isSwap = true
    if (type === "pay") {
      isSwap = false
    }

    if (!receiveToken) {
      if (receiveAmount && receiveAmount !== "") {
        errors["receiveToken"] = translate('error.receive_token_not_have_amount_have')
          || "Cannot set receive amount of unknown token"
      }
    }

    if (receiveAmount && receiveAmount !== "") {
      receiveAmount = receiveAmount.toString();

      if (isNaN(receiveAmount)) {
        errors["receiveAmount"] = translate('error.receive_amount_is_invalid_number')
          || "Receive amount is invalid number"
      }
      if (receiveAmount <= 0) {
        errors["receiveAmount"] = translate('error.receive_amount_must_be_positive')
          || "Receive amount must be positive number"
      }
    } else {
      receiveAmount = null
    }


    if (commissionID) {
      if (validator.verifyAccount(commissionID)) {
        errors["commissionID"] = translate('error.commission_address_must_be_valid')
          || "Commission address must be a valid ethereum address"
      }
    }

    if (callback) {
      if (!callback.startsWith("https://")) {
        errors["callback"] = translate('error.callback_https')
          || "Callback must be a https location"
      }
    }

    if (signer) {
      var invalidAddresses = []
      var addressArr = signer.split("_")

      addressArr.map(address => {
        if (validator.verifyAccount(address)) {
          invalidAddresses.push(address)
        }
      })
      if (invalidAddresses.length > 0) {
        errors["signer"] = translate('error.signer_include_invalid_address') || "Signer include invalid addresses"
      }
    }

    if (!validator.verifyNetwork(network)) {
      errors["network"] = translate('error.invalid_network') || "Current network is not supported"
    }

    paymentData = Web3.utils.utf8ToHex(paymentData);
    hint = Web3.utils.utf8ToHex(hint);

    if (validator.anyErrors(errors)) {
      store.dispatch(haltPayment(errors))
    } else {
      receiveToken = receiveToken ? receiveToken : "KNC"
      if (type === "swap" && defaultPairArr.length === 2) {
        receiveToken = defaultPairArr[1]
      }
      var tokenAddr = tokenData[receiveToken].address

      store.dispatch(initParamsExchange(
        receiveAddr, receiveToken, tokenAddr, receiveAmount, products, callback, network, paramForwarding,
        signer, commissionID, isSwap, type, pinnedTokens, defaultPairArr, paymentData, hint, tokenData, theme, title
      ));

      //init analytic
      var analytic = new AnalyticFactory({ listWorker: ['mix'], network })
      store.dispatch(initAnalytics(analytic))
    }
  }).catch(err => {
    var errors = {
      tokens: "Cannot get list tokens"
    }
    store.dispatch(haltPayment(errors))
  })
}

Modal.setAppElement('body');

window.kyberWidgetInstance = {};
window.kyberWidgetInstance.render = (widgetId) => {
  var appId = widgetId ? widgetId : constants.APP_NAME;
  const appContainer = document.getElementById(appId);

  if (!document.getElementById(appId)) {
    return
  }
  store.dispatch(initSession())
  initParams(appId)

  ReactDOM.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <Layout />
      </Provider>
    </PersistGate>, appContainer
  );
};
window.kyberWidgetInstance.destroy = (widgetId) => {
  const appId = widgetId ? widgetId : constants.APP_NAME;
  const appContainer = document.getElementById(appId);
  ReactDOM.unmountComponentAtNode(appContainer);
};

window.kyberWidgetInstance.render()
