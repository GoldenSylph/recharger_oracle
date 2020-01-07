console.log('Starting oracle...');
const express = require('express');
const ethers = require('ethers');
const utils = require('ethers/utils');

let mainnetProvider = ethers.getDefaultProvider("homestead");
let rinkebyProvider = ethers.getDefaultProvider("rinkeby");

const app = express();
const port = process.env.PORT || 5000;

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => res.send('Recharger oracle is online'));

const getTxInfo = (req, res, prov) => {
  let responseJson = { txInfo: "0x00000000000000000000000000000000000000000" };
  console.log('Trying tx hash:', req.params.txHash);
  prov.getTransactionReceipt(req.params.txHash)
    .then((receipt) => {
      console.log('Got receipt:', receipt.transactionHash);
      prov.getTransaction(receipt.transactionHash)
        .then((response) => {
          console.log('Got tx gas price:', response.gasPrice.toString())
          responseJson.txInfo = response.from + receipt.gasUsed.mul(response.gasPrice).toString();
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
};

const getTxEvents = (req, res, prov) => {
  console.log('Trying tx hash events:', req.params.txHash);
  prov.getTransactionReceipt(req.params.txHash)
    .then((receipt) => {
      console.log('Got receipt:', receipt.transactionHash);
      for (i = 0; i < receipt.logs.length; i++) {
        try {
          receipt.logs[i].decoded = ethers.utils.defaultAbiCoder.decode(
            ['uint256', 'uint256'],
            receipt.logs[i].data
          );
        } catch (err) {
          continue;
        }
      }

      res.json(receipt.logs);
    })
    .catch((error) => {
      const message = 'Unable to get tx receipt for events extraction. Reason:' + error;
      console.error(message);
      res.json({message});
    });
};


app.get('/rinkeby/:txHash', (req, res) => getTxInfo(req, res, rinkebyProvider));
app.get('/mainnet/:txHash', (req, res) => getTxInfo(req, res, mainnetProvider));
app.get('/rinkeby/events/:txHash', (req, res) => getTxEvents(req, res, rinkebyProvider));
app.get('/mainnet/events/:txHash', (req, res) => getTxEvents(req, res, mainnetProvider));

app.listen(port, () => console.log(`Oracle app listening on port ${port}!`));
