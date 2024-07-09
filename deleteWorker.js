const { parentPort, workerData } = require("worker_threads");
const RATE_LIMIT = 30; // Requests per worker per second

// Add api key and secret here
const sailthru = require('sailthru-client').createSailthruClient('API_KEY', 'API_SECRET');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiDeleteWrapped(id, key) {
  return new Promise((resolve, reject) => {
      sailthru.apiDelete('user', { id, key }, (err, response) => {
          if (err) {
              reject(err);
          } else {
              resolve(response);
          }
      });
  });
}

async function processWorkerData() {
  const REQUEST_INTERVAL = 1000 / RATE_LIMIT; // Calculate interval in milliseconds

  for (let i = 0; i < workerData.length; i++) {
      const email = workerData[i].email;
      const extid = workerData[i].extid;


      console.log(`Deleting profile for ${email} or ${extid}`);

      try {
          // Delete the profile by email if it exists
          if (email) {
            const emailDeleteResponse = await apiDeleteWrapped(email, 'email');
            parentPort.postMessage(`Successfully deleted profile for email: ${email}`);
          }
          // Delete the profile by extid if it exists
          else if (extid) {
              const extidDeleteResponse = await apiDeleteWrapped(extid, 'extid');
              parentPort.postMessage(`Successfully deleted profile for extid: ${extid}`);
          }

      } catch (error) {
          parentPort.postMessage(`Error deleting profile for ${email} or ${extid}: ${JSON.stringify(error)}`);
      }

      // Only delay if more requests to follow
      if (i < workerData.length - 1) {
          await delay(REQUEST_INTERVAL);
      }
  }
}

processWorkerData();