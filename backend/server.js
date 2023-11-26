const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require("express");
var cors = require('cors')
const moment = require("moment");
const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use('/api/scanapi/scansbydate', createProxyMiddleware({
  //target: 'https://kurewellukca-idscanner.azurewebsites.net/api/scanapi/scansbydate',
  target: 'https://kurewellukca-idscanner.azurewebsites.net/',
  changeOrigin: true,
  secure: true,
  
}));
app.listen(port, () => console.log(`Listening on port ${port}!`));

function getFormattedDate(day = 0, format = 'YYYY-MM-DDThh:mm:ss') {
  let date = '';
  date = moment();
  date = date.add(day, 'days');
  return date.utc().format(format);
};