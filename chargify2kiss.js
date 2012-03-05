
var request = require('request');
var qs = require('querystring');
var async = require('async');

console.log('Chargify, meet kiss.');
var CHARGIFYSUBDOMAIN=process.env.CHARGIFYSUBDOMAIN;
var CHARGIFYAPIKEY=process.env.CHARGIFYAPIKEY;

if (!CHARGIFYSUBDOMAIN || !CHARGIFYAPIKEY){
  console.log('missing CHARGIFYSUBDOMAIN or CHARGIFYAPIKEY');
  process.exit(1);
}
var CHARGIFYURL='https://'+CHARGIFYAPIKEY+'@'+CHARGIFYSUBDOMAIN+'.chargify.com';

console.log('CHARGIFYURL: ',CHARGIFYURL);

var subscriptionLookup={};
getJSON('/subscriptions',function(err,subscriptions){
  console.log('--Subscriptions:%d',subscriptions.length);
  subscriptions.forEach(function(obj){
    var subscription = obj.subscription;
    // console.log('-subscription:'+JSON.stringify(subscription,null,2));
    // console.log('-subscription:'+subscription.id);
    subscriptionLookup[""+subscription.id]={
      id:subscription.id,
      plan:subscription.product.handle,
      reference:subscription.customer.reference,
      email:subscription.customer.email
    };
  });
  // console.log(subscriptionLookup);
  
  getJSON('/transactions',function(err,transactions){
    if (err) return;
    console.log('--Transactions:%d',transactions.length);
    transactions.forEach(function(obj){
      var transaction=obj.transaction;
      // console.log(transaction);
      
      var stamp = new Date(transaction.created_at);
      var subscriptionId=""+transaction.subscription_id;
      var subscription = subscriptionLookup[subscriptionId]||subscriptionId;
      console.log(JSON.stringify({
        id:transaction.id,
        type:transaction.transaction_type,
        stamp:stamp.toISOString(),
        memo:transaction.memo,
        amount:transaction.amount_in_cents,
        balance:transaction.ending_balance_in_cents,
        subscription:subscription
      }));


      // output the kiss get url:      
      eventName = {
        charge:'charged',
        adjustment:'billed',
        payment:'billed'
      }[transaction.transaction_type];
      
      if (!eventName) {
        console.log('unhandled transcation_type:',transaction.transaction_type);
        return;
      }

      var versionSuffix='V2';
      var params={
        'Plan Name':subscription.plan,
        'Billing Description':transaction.memo,
        _n:eventName+versionSuffix,
        _k:'d2fb45441ee59b9e0e5fd42360be788b06a10b71',
        _p:subscription.email,
        _t:Math.floor(stamp.getTime()/1000),
        _d:1
      };
      
      // now add propertie(s) for amount
      var amount = transaction.amount_in_cents/100;
      if (eventName==='billed'){
        params[eventName+'Amt'+versionSuffix]=amount; // billedAmtv1
      } else if (eventName==='charged'){
        params[eventName+'Amt'+versionSuffix]=amount; // chargedAmtv1
        var memo = transaction.memo;
        var isTax = memo && /^tax/i.test(memo);
        // console.log(JSON.stringify({type:eventName,tax:isTax,memo:memo,amt:amount}));
        if (!isTax){
          params[eventName+'AmtNoTax'+versionSuffix]=amount; // chargedAmtNoTaxv1
        }
      }
      var baseuri='http://trk.kissmetrics.com/e?';
      var url = baseuri+qs.stringify(params)
      console.log('curl', url);
      // request(url);
    });
  });
});

// fetches all pages, perPage (const) at a time
function getJSON(path,cb){ 
  var weAreDone = false;
  var perPage=30;
  var page=0; // first fetch pre-increments: start at page 1
  var alldata=[];
  async.until(
      function () { return weAreDone; },
      function (next) {
        page++;
        // console.log('doing page:%d',page)
        getJSONPage(path,perPage,page,function(err,data){
          if (!err) {
            alldata = alldata.concat(data);
          }
          weAreDone = data.length==0; // always fetch a last empty page ...
          next(err);
        });
      },
      function (err) {
        console.log('Fetched: %d records in %d pages of size %d',alldata.length,page,perPage);
        cb(err,alldata);
      }
  );
}
function getJSONPage(path,perPage,page,cb){
  // qs options hasn/t landed in request yet.
  // should maybe use url.parse directly
  var params = qs.stringify({ per_page : perPage, page:page, since_date:'2011-12-07' });
  request({
    uri:CHARGIFYURL+path+'?'+params,
    json:true,
    // qs: { per_page : perPage, page:page }

  }, function (error, response, data) {
    // console.log(response);
    if (cb) cb(error,data);    
    if (error) {
     console.log(error);
    } else if (response.statusCode != 200) {
      console.error('non-200-response',response.statusCode);
    }
  })
}

