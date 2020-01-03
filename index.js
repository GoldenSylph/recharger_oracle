console.log('Starting oracle...');
const express = require('express');
const ethers = require('ethers');
const utils = require('ethers/utils');

let provider = ethers.getDefaultProvider("homestead");
const app = express();
const port = process.env.PORT || 5000;

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => res.send('Recharger oracle is online'));

app.get('/:txHash', (req, res) => {
  let responseJson = { txFee: -1 };
  console.log('Trying tx hash:', req.params.txHash);
  provider.getTransactionReceipt(req.params.txHash)
    .then((receipt) => {
      console.log('Got receipt:', receipt.transactionHash);
      provider.getTransaction(receipt.transactionHash)
        .then((response) => {
          console.log('Got tx gas price:', response.gasPrice.toString())
          responseJson.txFee = receipt.gasUsed.mul(response.gasPrice).toString();
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
