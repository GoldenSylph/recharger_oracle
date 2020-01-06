console.log('Starting oracle...');
const express = require('express');
const ethers = require('ethers');
const utils = require('ethers/utils');

let provider = ethers.getDefaultProvider("homestead");
let rinkebyProvider = ethers.getDefaultProvider("rinkeby");

const app = express();
const port = process.env.PORT || 5000;

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => res.send('Recharger oracle is online'));

app.get('/rinkeby/:txHash', (req, res) => {
  let responseJson = { txInfo: "0x00000000000000000000000000000000000000000" };
  console.log('Trying tx hash:', req.params.txHash);
  rinkebyProvider.getTransactionReceipt(req.params.txHash)
    .then((receipt) => {
      console.log('Got receipt:', receipt.transactionHash);
      rinkebyProvider.getTransaction(receipt.transactionHash)
        .then((response) => {
          console.log('Got tx gas price:', response.gasPrice.toString())
          responseJson.txInfo = response.from + "_" + receipt.gasUsed.mul(response.gasPrice).toString();
          res.json(responseJson);
        })
        .catch((error) => {
          console.error('Unable to get gas limit. Reason:', error);
          res.json(responseJson);
        });
    })
    .catch((error) => {
      console.error('Unable to get tx receipt. Reason:', error);
      res.json(responseJson);
    });
});

app.get('/mainnet/:txHash', (req, res) => {
  let responseJson = { txInfo: "0x00000000000000000000000000000000000000000" };
  console.log('Trying tx hash:', req.params.txHash);
  provider.getTransactionReceipt(req.params.txHash)
    .then((receipt) => {
      console.log('Got receipt:', receipt.transactionHash);
      provider.getTransaction(receipt.transactionHash)
        .then((response) => {
          console.log('Got tx gas price:', response.gasPrice.toString())
          responseJson.txInfo = response.from + "_" + receipt.gasUsed.mul(response.gasPrice).toString();
          res.json(responseJson);
        })
        .catch((error) => {
          console.error('Unable to get gas limit. Reason:', error);
          res.json(responseJson);
        });
    })
    .catch((error) => {
      console.error('Unable to get tx receipt. Reason:', error);
      res.json(responseJson);
    });
});

app.listen(port, () => console.log(`Oracle app listening on port ${port}!`));
