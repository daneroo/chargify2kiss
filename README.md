# Download chargify transactions and upload them to KissMetrics

## Fetching from chargify
Downloading chargify transactions as json

    export CHARGIFYAPIKEY=<zzzzz:x>
    export CHARGIFYSUBDOMAIN=yoursubdomain
    export CHARGIFYURL="https://${CHARGIFYAPIKEY}@${CHARGIFYSUBDOMAIN}.chargify.com"
    export FLAGS='-s -H Accept:application/json -H Content-Type:application/json'

I drop these settings in `.gitignored` `privateSettings.sh` for testing.

    source privateSettings.sh

Fetch transcations
    
    curl ${FLAGS} -u ${CHARGIFYAPIKEY} https://${CHARGIFYSUBDOMAIN}.chargify.com/transactions |python -mjson.tool
    or
    curl ${FLAGS} ${CHARGIFYURL}/transactions.json |python -mjson.tool

You can qualify these with `page`,`per_page`,`kinds[]`,`since_date`,`until_date`,`since_id`,`max_id`.

To lookup a `subscription_id`,

    curl ${FLAGS} "${CHARGIFYURL}/subscriptions" |python -mjson.tool
    # or lookup a specific transaction
    curl ${FLAGS} "${CHARGIFYURL}/subscriptions/<subscription_id>" |python -mjson.tool

## Node invocation

    npm install # do this once
    source privateSettings.sh
    node chargify2kiss

Figure out how to do a while loop for paging.
cache the subscription lookup.

## Pushing to KissMetrics
do a get request to `http://trk.kissmetrics.com/e`

    _kmq.push(['record', 'billed', {'Plan Type':'handle-1', 'Billing Amount':'1.00'}]);

http://trk.kissmetrics.com/e?Plan%20Type=handle-1&Billing%20Amount=1.00&_n=billed&_k=d2fb45441ee59b9e0e5fd42360be788b06a10b71&_p=daniel.lauzon%40gmail.com&_t=1330550219

From Kiss support:
Ah, to actually use the _t value that you manually pass in, you also need to set _d=1

## pushing to temp mongo

    #start mongo
    mongod --dbpath data --quiet --logpath /dev/null >/dev/null 2>&1 &
    #stop monogo
    echo "db.shutdownServer();" | mongo admin >/dev/null
    
    #example max-aggreagtion in mongo-shell
    
    db.users.find({},{_id:false,created:true}).forEach(printjson);
    db.users.group({
        key: {},
        initial: {maxdate: 0},
        reduce: function(obj,agg){ if(obj.created>agg.maxdate) agg.maxdate=obj.created;},
        finalize: function(agg){ agg.stamp = new Date(agg.maxdate*1000) }
    });
                 
                 