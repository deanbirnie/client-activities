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
export const sqlScriptGen = async (activitiesJsonObject, calculatedDueDate) => {
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
                const activityTask1 = singleActivityObject.Task1;
                const activityTask2 = singleActivityObject.Task2;
                const activityTask3 = singleActivityObject.Task3;
                const activityTask4 = singleActivityObject.Task4;
                const activityTask5 = singleActivityObject.Task5;
                
                const checkActivityId = `USE ${process.env.MSSQL_DATABASE};` +
                    `\nSELECT TOP 1 1 AS Exists FROM Activities WHERE Id = ${activityId};`
                const activityIdResult = await mssql.query(checkActivityId);
                
                if (!activityIdResult || activityIdResult.recordset > 0) {
                    const insertQuery = `
                    INSERT INTO [dbo].[Activities] (
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
                        '${calculatedDueDate}',
                        '${activityTask1}',
                        '${activityTask2}',
                        '${activityTask3}',
                        '${activityTask4}',
                        '${activityTask5}'
                    )`;

                    const checkClientQuery = `SELECT TOP 1 1 AS Exists FROM Clients WHERE Client = '${activityClient}';`;
                    const clientCheckResult = await mssql.query(checkClientQuery);

                    if (clientCheckResult.recordset.length === 0) {
                        const insertClientQuery = `INSERT INTO [dbo].[Clients] ([Client]) VALUES ('${activityClient}');`;
                    }

                    const fileContent = `${insertQuery}\n${insertClientQuery}\n`;

                    fs.appendFile(newScript, fileContent, (err) => {
                        if (err) {
                            console.error(`There was an error appending to the file: ${err}`);
                        } else {
                            console.log(`Activity ${activityId} successfully added to script.`);
                        }
                    });

                    await mssql.close();

                    return newScript;
                } else {
                    console.log("Activity already exists in the database.");
                    await mssql.close();
                }
            }
        }
    } catch (error) {
        console.error(`There was an error parsing the JSON object: ${error}`)
        await mssql.close();
    }
};

const generateActivityInsertionScript = async () => {
    const newScriptPath = process.env.SQL_SCRIPT_STORAGE_LOCATION || `/mnt/c/Users/deani/Desktop/Innosys-Assessment/client-activities-server/src/db/sql_scripts_executed/`;
    const fileName = `${uuid()}.sql`;
    const newScript = path.join(newScriptPath, fileName);

    const comment = `-- This script was generated on ${moment().format("DD/MM/YYYY, at HH:mm:ss:SSS")}\n`;
    const useDatabase = `\nUSE ${process.env.MSSQL_DATABASE};\n`
    const createTableClients = `\nIF NOT EXISTS (SELECT * FROM` +
        ` sys.objects WHERE object_id = OBJECT_ID(N'[dbo].` +
        `[Clients]') AND type in (N'U'))` +
        `\nBEGIN\n` +
        `\tCREATE TABLE [dbo].[Clients] (\n` +
        `\t\t[Id] INT IDENTIY(1,1) PRIMARY KEY,\n` +
        `\t\t[Client] NVARCHAR(100) NOT NULL,\n` +
        `\t);\n` +
        `END;\n`
    const createTableActivities = `\nIF NOT EXISTS (SELECT *` +
        ` FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].` +
        `[activities]') AND type in (N'U'))` +
        `\nBEGIN\n` +
        `\tCREATE TABLE [dbo].[Activities] (\n` +
        `\t\t[Id] INT PRIMARY KEY,\n` +
        `\t\t[Description] NVARCHAR(MAX),\n` +
        `\t\t[Client] NVARCHAR(100),\n` +
        `\t\t[StartDate] DATETIME,\n` +
        `\t\t[Duration] INT,\n` +
        `\t\t[DueDate] DATETIME,\n` +
        `\t\t[Task1] NVARCHAR(MAX),\n` +
        `\t\t[Task2] NVARCHAR(MAX),\n` +
        `\t\t[Task3] NVARCHAR(MAX),\n` +
        `\t\t[Task4] NVARCHAR(MAX),\n` +
        `\t\t[Task5] NVARCHAR(MAX)\n` +
        `\t);\n` +
        `ALTER TABLE [dbo].[activities] ADD CONSTRAINT [FK_activities_clients]` +
        ` FOREIGN KEY ([client]) REFERENCES [dbo].[clients]([title_name]);` +
        `END;\n`

        const content = `${comment}${useDatabase}${createTableClients}${createTableActivities}\n`

        await fs.writeFile(newScript, content, {
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
