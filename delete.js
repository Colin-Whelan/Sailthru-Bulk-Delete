const { Worker } = require('worker_threads');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const numWorkers = 4; // Increase this number to speed up the process. Max = CPU threads.

async function processFile(filePath) {
    let workerData = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                workerData.push(data);
            })
            .on('end', resolve)
            .on('error', reject);
    });

    
    const tasksPerWorker = Math.ceil(workerData.length / numWorkers);
    const promises = [];

    // Create a log file with date-time and file label in the name
    const dateTime = new Date().toISOString().replace(/:/g, '-');
    const logFilePath = `delete_log.txt`;
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    for (let i = 0; i < numWorkers; i++) {
        const start = i * tasksPerWorker;
        const end = start + tasksPerWorker;
        const workerPath = path.resolve(__dirname, 'deleteWorker.js');
        const worker = new Worker(workerPath, { workerData: workerData.slice(start, end) });
        promises.push(new Promise((resolve, reject) => {
            worker.on('message', (msg) => {
                console.log(msg);
                logStream.write(`${dateTime} - ${msg}\n`);
            });
            worker.on('error', (err) => {
                reject(err);
                logStream.write(`${dateTime} - Error: ${err}\n`);
            });
            worker.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
                resolve();
            });
        }));
    }

    await Promise.all(promises);
    console.log(`All delete requests processed`);
    logStream.end();
}

async function processCsv() {
    console.log('Starting processing for users_to_delete_noIds.csv');
    await processFile('users_to_delete.csv');
}

processCsv().catch(err => console.error('Error processing files:', err));
