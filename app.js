import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from "url";
import youtubeRoutes from './server/routes/youtube.js';
import spotifyRoutes from './server/routes/spotify.js';
dotenv.config()
const CLIENT_URL = process.env.CLIENT_URL;

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientBuildPath = path.join(__dirname, "./client/dist");

app.use(express.static(clientBuildPath));



const corsOptions = {
    origin: CLIENT_URL,  //use '*' for all origins
    credentials: true,  // allow cookies to be sent in requests
};
app.use(cors(corsOptions));
app.set('trust proxy', 1);
app.use(express.json());
app.use('/youtube',youtubeRoutes);
app.use('/spotify',spotifyRoutes);

// For React Router:
app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });

app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});


export default app;