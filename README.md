# Download chargify transactions and upload them to KissMetrics

## Fetching from chargify
Downloading chargify transactions as json

    export CHARGIFYAPIKEY=<zzzzz:x>
    export CHARGIFYSUBDOMAIN=yoursubdomain
    export CHARGIFYURL="https://${CHARGIFYAPIKEY}@${CHARGIFYSUBDOMAIN}.chargify.com"
    
Fetch transcations
    
    curl -s -u ${CHARGIFYAPIKEY} https://${CHARGIFYSUBDOMAIN}.chargify.com/transactions.json |python -mjson.tool
    or
    curl -s ${CHARGIFYURL}/transactions.json |python -mjson.tool

You can qualify these with `page`,`per_page`,`kinds[]`,`since_date`,`until_date`,`since_id`,`max_id`.

To lookup a `subscription_id`,

    curl -s "${CHARGIFYURL}/subscriptions.json" |python -mjson.tool
    # or lookup a specific transaction
    curl -s "${CHARGIFYURL}/subscriptions/<subscription_id>.json" |python -mjson.tool

## Node iteration
Figure out how to do a while loop for paging.
cache the subscription lookup.