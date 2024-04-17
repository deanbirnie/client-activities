/*
This module creates a connection to the MSSQL database specified in your .env
file (or the default).
*/
import mssql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// See https://www.npmjs.com/package/mssql#configuration-1 for more information
const dbConfig = {
    user: process.env.MSSQL_USER || "sa",
    password: process.env.MSSQL_PASSWORD || "",
    server: process.env.MSSQL_SERVER || "localhost",
    port: process.env.MSSQL_PORT,
    options: {
        encrypt: process.env.MSSQL_AZURE_ENCRYPT || false,
        trustServerCertificate: true,
    },
};

export const dbConnect = async () => {
    try {
        await mssql.connect(dbConfig);
        console.log("Connection to MSSQL Server successful.")
    } catch (error) {
        console.error(`Connection to MSSQL Server failed: ${error}`);
    }
};
