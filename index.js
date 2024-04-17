import express from "express";
import dotenv from "dotenv";
import path from "path";
import chokidar from "chokidar";
import multer from "multer";
import { addToQueue } from "./src/csv-handling/csvHandler.js";
import cors from "cors";

dotenv.config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, process.env.FILE_IMPORT_DIR)
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + uniqueName + ".csv");
    }
  })
  
const upload = multer({ storage: storage })

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Watch import directory for new CSV file to process
const importDirectory = process.env.FILE_IMPORT_DIR;
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

    app.post("/api/upload", upload.single("file"), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "File not uploaded." });
        }

        return res.status(200).json({ message: "File uploaded successfully." });
    });

    app.get("/api/test", (req, res) => {
        return res.status(200).json({ message: "Server is running." });
    });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})