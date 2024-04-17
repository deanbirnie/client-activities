import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import chokidar from 'chokidar';
import { addToQueue } from './src/csv-handling/csvHandler.js';

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Watch import directory for new CSV file to process
const importDirectory = process.env.IMPORT_DIRECTORY || "/mnt/c/Users/deani/Desktop/Innosys-Assessment/client-activities-server/import";
console.log(`${importDirectory} is being watched for new files.`);

const watcher = chokidar.watch(importDirectory, {
    persistent: true,
    usePolling: true,
});

watcher
    .on("ready", () => console.log("Scan complete. Ready for changes"))
    .on("add", (filePath) => {
        const fileName = path.basename(filePath);
        console.log(`New file imported: ${fileName}`);
        if (path.extname(filePath) === ".csv") {
            console.log(`File ${fileName} is a CSV file, adding to queue.`)
            addToQueue(filePath);
        } else {
            console.log(`File ${fileName} is not a CSV file, skipping.`);
        }
    })
    .on("change", (filePath) => console.log(`File ${path.basename(filePath)} has been changed`))
    .on("error", error => console.log(`Watcher error: ${error}`))
    // .on("raw", (event, path, details) => { // internal
    //     console.log("Raw event info:", event, path, details);
    //   });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})