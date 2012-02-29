
var request = require('request');

console.log('Chargify, meet kiss.');
var CHARGIFYSUBDOMAIN=process.env.CHARGIFYSUBDOMAIN;
var CHARGIFYAPIKEY=process.env.CHARGIFYAPIKEY;
var CHARGIFYURL='https://'+CHARGIFYAPIKEY+'@'+CHARGIFYSUBDOMAIN+'.chargify.com';

console.log('CHARGIFYURL: ',CHARGIFYURL);

var lastSubscr;
getJSON('/transactions',function(err,data){
  if (err) return;
  console.log('--Transactions:%d',data.length);
  data.forEach(function(obj){
    // console.log(trans);
    var trans=obj.transaction;
    stamp = new Date(trans.created_at);
    console.log({id:trans.id,type:trans.type,stamp:stamp,amt:trans.amount_in_cents,subscr:trans.subscription_id});
    lastSubscrId=trans.subscription_id;
  });

  console.log('--LastSubscription:%d',lastSubscrId);
  getJSON('/subscriptions/'+lastSubscrId,function(err,data){
    console.log('++LastSubscription:%d',lastSubscrId);
    console.log(data);
  });  
});

function getJSON(path,cb){
  request({
    uri:CHARGIFYURL+path,
    json:true,
    qs: { per_page : 3, page:1 }
  }, function (error, response, data) {
    if (cb) cb(error,data);    
    if (error) {
     console.log(error);
    } else if (response.statusCode != 200) {
      console.error('non-200-response',response.statusCode);
    }
  })
}

