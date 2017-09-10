/*var RTM = require("satori-rtm-sdk");

var endpoint = "wss://tpolcsom.api.satori.com";
var appKey = "DcB10b9b4E92C596bE37a5D30b9eE67f";
var channel = "test_channel";

var client = new RTM(endpoint, appKey);

client.on('enter-connected', function () {
  console.log('Connected to Satori RTM!');
});

var subscription = client.subscribe(channel, RTM.SubscriptionMode.SIMPLE);

subscription.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {
    console.log('Got message:', msg);
  });
});

client.start();*/