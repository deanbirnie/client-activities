/* 
This module handles CSV file processing once new files have been detected in the import
directory, queueing the files for processing, calling the processing function,
and ultimately moving them to a directory once they have been successfully
processed.
*/

import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import mssql from "mssql";
import { calcDueDate } from "./dueDateCalc.js";
import { sqlScriptGen } from "../db/sqlScriptGenerator.js";
import { dbConnect } from "../db/db.js";

dotenv.config();

const processedDirectory = process.env.PROCESSED_DIRECTORY;

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

/* Appends new files to the fileQueue array, calls the processFile method.
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
        try {
            const parsedData = await parseCSV(filePath);
            console.log(parsedData);

            await dbConnect();

            const createDatabase = `CREATE DATABASE IF NOT EXISTS ${process.env.MSSQL_DATABASE};\n`;
            await mssql.query(createDatabase);

            // Call the dueDateCalculator function to calculate the "DueDate" value
            for (const key in parsedData) {
                const dueDate = await calcDueDate(parsedData[key]["StartDate"], parsedData[key]["Duration"]);
                const scriptFile = await sqlScriptGen(parsedData, dueDate);
                const scriptContent = fs.readFileSync(scriptFile);
                const executeScript = await mssql.query(scriptContent)
                console.log("Script executed successfully.");
                console.log(`${executeScript}`);
            };

            await mssql.close();

            console.log(`${path.basename(filePath)} processed successfully, moving to processed directory.`);
            moveToProcessed(filePath);
        } catch (error) {
            console.error(`Processing error - ${error}`)
        }
    } catch (error) {
        console.error(`There was an error while processing this file. Error: ${error}`)
    }
};

// Moves the file to the processed directory
const moveToProcessed = (filePath) => {
    try {
        const newFilePath = path.join(processedDirectory, path.basename(filePath));
        fs.renameSync(filePath, newFilePath);
        console.log(`${path.basename(filePath)} moved to ${processedDirectory}`);
    } catch (error) {
        console.error(`There was an error moving this file: ${error}`);
    }
};

// Parses the CSV file and returns the data as an array for further processing
const parseCSV = async (filepath) => {
    const csvDelimiter = process.env.CSV_DELIMITER || ",";
    const lineSeparator = process.env.LINE_SEPARATOR || "\n";
    const jsonObject = {};

    const csvFile = fs.readFileSync(filepath);

    const csvArray = csvFile.toString().split(lineSeparator);

    if (csvArray.length === 0) {
        throw new Error("CSV file is empty");
    }
    const headerArray = csvArray[0].split(csvDelimiter);
    for (let i = 0; i < headerArray.length; i++) {
        headerArray[i] = headerArray[i].trim().replace(/^'|'$/g, "").trim();
    }

    // Create an object for each individual activity (row) in the file and store the activity objects in a JSON object
    for (let j = 1; j < csvArray.length; j++) {
        let activityObj = {};
        const row = csvArray[j].split(csvDelimiter);
        for (let k = 0; k < row.length; k++) {
            row[k] = row[k].trim().replace(/^'|'$/g, "").trim();
            activityObj[headerArray[k]] = row[k];
        }
        const key = j - 1;
        jsonObject[key] = activityObj;
    }
    return jsonObject;
};
