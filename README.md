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