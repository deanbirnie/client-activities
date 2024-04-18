/*
This module is used to generate SQL script files for data take on.
*/
import { dbConnect } from "./db.js";
import mssql from "mssql";
import fs from "fs";
import moment from "moment";
import { uuid } from "uuidv4";
import path from "path";

/*
Function: sqlScriptGen
Description: This function generates a SQL script file for a given activity
            object and calculated due date for that activity.
Parameters:
            @activityJsonObject: JSON Object - The activity object to generate
            the script for.
            @calculatedDueDate: Date (YYYYMMDDTHHmm) - The calculated due date
            for the activity.
*/
export const sqlScriptGen = async (activitiesJsonObject, calculatedDueDates) => {
    await dbConnect();
    
    const newScript = await generateActivityInsertionScript();

    try {
        for (const key in activitiesJsonObject) {
            if (Object.hasOwnProperty.call(activitiesJsonObject, key)) {
                const singleActivityObject = activitiesJsonObject[key];
                const activityId = singleActivityObject.Id;
                const activityDescription = singleActivityObject.Desctiption;
                const activityClient = singleActivityObject.Client;
                const activityStartDate = singleActivityObject.StartDate;
                const activityDuration = singleActivityObject.Duration;
                const activityDueDate = calculatedDueDates[key];
                const activityTask1 = singleActivityObject.Task1;
                const activityTask2 = singleActivityObject.Task2;
                const activityTask3 = singleActivityObject.Task3;
                const activityTask4 = singleActivityObject.Task4;
                const activityTask5 = singleActivityObject.Task5;
                
                
                try {
                    const checkActivityId = `SELECT * FROM Activities WHERE Id = ${activityId};`
                    await mssql.query(checkActivityId);
                } catch {
                    const createActivitiesTable = `CREATE TABLE [dbo].[Activities] (
                        [Id] INT PRIMARY KEY,
                        [Description] NVARCHAR(MAX),
                        [Client] NVARCHAR(100),
                        [StartDate] NVARCHAR(13),
                        [Duration] INT,
                        [DueDate] NVARCHAR(13),
                        [Task1] NVARCHAR(MAX),
                        [Task2] NVARCHAR(MAX),
                        [Task3] NVARCHAR(MAX),
                        [Task4] NVARCHAR(MAX),
                        [Task5] NVARCHAR(MAX),
                        );`;
                    await mssql.query(createActivitiesTable);
                }
                const insertQuery = `\nINSERT INTO [dbo].[Activities] (
                    [Id],
                    [Description],
                    [Client],
                    [StartDate],
                    [Duration],
                    [DueDate],
                    [Task1],
                    [Task2],
                    [Task3],
                    [Task4],
                    [Task5]
                ) VALUES (
                    ${activityId},
                    '${activityDescription}',
                    '${activityClient}',
                    '${activityStartDate}',
                    ${activityDuration},
                    '${activityDueDate}',
                    '${activityTask1}',
                    '${activityTask2}',
                    '${activityTask3}',
                    '${activityTask4}',
                    '${activityTask5}'
                );\n`;

                fs.appendFile(newScript, insertQuery, (err) => {
                    if (err) {
                        console.error(`There was an error appending to the file: ${err}`);
                    } else {
                        console.log(`Activity ${activityId} successfully added to script.`);
                    }
                });
            } else {
                console.log("Activity already exists in the database.");
            }
        }
        console.log(`New script file: ${newScript}`)
        return newScript;

    } catch (error) {
        console.error(`There was an error parsing the JSON object: ${error}`)
    }
};

const generateActivityInsertionScript = async () => {
    const newScriptPath = process.env.SQL_SCRIPT_STORAGE_LOCATION;
    const fileName = `${uuid()}.sql`;
    const newScript = path.join(newScriptPath, fileName);

    const comment = `-- This script was generated on ${moment().format("DD/MM/YYYY, HH:mm:ss:SSS")}\n`;
    const useDatabase = `\nUSE ${process.env.MSSQL_DATABASE};\n`

    const content = `${comment}${useDatabase}\n`

    fs.writeFile(newScript, content, {
        encoding: "utf-8",
        flag: "w"
    }, (err) => {
        if (err) {
            console.error(`There was an error writing the file: ${err}`);
        } else {
            console.log(`File ${newScript} successfully created.`)
        }
    })

    return newScript;
};
