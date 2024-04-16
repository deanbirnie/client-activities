import fs from "fs";
import dotenv from "dotenv";
import path from "path";

/* 
This module handles CSV file processing once new files have been detected in the import
directory, queueing the files for processing, calling the processing function,
and ultimately moving them to a directory once they have been successfully
processed.
*/

dotenv.config();

const processedDirectory = process.env.PROCESSED_DIRECTORY || "/mnt/c/Users/deani/Desktop/Innosys-Assessment/client-activities-server/processed/";

// Array to hold files to be processed
const fileQueue = [];

// Processing flag to prevent multiple processing instances
let processing = false;

// Once a file is detected it should be appended to the fileQueue array
export const addToQueue = (filePath) => {
    console.log(`File added to queue: ${path.basename(filePath)}`);
    fileQueue.push(filePath);
    processingQueue();
};

/* Appends new files to the fileQueue array, calls the processFile method and
then calls itself recursively to work through the fileQueue array. 
*/
const processingQueue = async () => {
    if (!processing && fileQueue.length > 0) {
        processing = true;

        const nextFile = fileQueue.shift();
        try {
            await processFile(nextFile);
            processing = false;
        } catch {
            console.error(`There was a problem processing this file: ${path.basename(nextFile)}`)
            processing = false;
        }
    }
};

/* Process the current CSV file, moving it to the processed directory once
completed
*/
const processFile = async (filePath) => {
    console.log(`Processing new file: ${filePath}`);
    try {
        console.log(`${path.basename(filePath)} processed successfully, moving to processed directory.`);
        try {
            const newFilePath = path.join(processedDirectory, path.basename(filePath));
            fs.renameSync(filePath, newFilePath);
            console.log(`${path.basename(filePath)} moved to ${processedDirectory}`);
        } catch {
            console.error(`${path.basename(filePath)} could not be moved to ${processedDirectory}`)
        }
    } catch (err) {
        console.error(`There was an error while processing this file. Error: ${err}`)
    }    
};
