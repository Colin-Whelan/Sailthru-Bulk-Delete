# Sailthru-Bulk-Delete
Bulk delete Sailthru profiles by email or extid

## Setup
Add your Sailthru API credentials in the `deleteWorker.js` file:

`const sailthru = require('sailthru-client').createSailthruClient('API_KEY', 'API_SECRET');`

Prepare your CSV file named users_to_delete.csv with the following format:

```
blank,email,extid
,test+delete1@gmail.com,delete1
,,delete2
,test+delete3@gmail.com,
```

**Note: The first column must be blank. Only 1 id type is required for each row.**

## Usage
**Always test with a small dataset, preferably with test accounts, before running large deletions for real profiles.**

Run the script:

`node delete.js`

The script will process the `users_to_delete.csv` file and attempt to delete user profiles based on the provided email or extid.

Progress and results will be logged to the console and a `delete_log.txt` file.

## Configuration
numWorkers(delete.js): Controls the number of concurrent workers (default is 4).

RATE_LIMIT(deleteWorker.js): Sets max requests per second per worker (default is 10).

[Sailthru Limits DELETE to just 40 requests per second](https://getstarted.meetmarigold.com/engagebysailthru/Content/developers/api-basics/technical.html?Highlight=rate%20limit#Rate). No use in changing the defaults at this time.
