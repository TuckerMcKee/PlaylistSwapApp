import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/auth.js';
import youtubeRoutes from './server/routes/youtube.js';
import spotifyRoutes from './server/routes/spotify.js';
import redisSession from './server/middleware/session.js';
import { CLIENT_URL } from './server/config/index.js';

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.join(__dirname, './client/dist');


const corsOptions = {
  origin: CLIENT_URL || false, 
  credentials: true,
};
app.use(cors(corsOptions));


app.set('trust proxy', 1);

app.use(express.json());

app.use(express.static(clientBuildPath, { index: false }));

// health check
app.get('/healthz', (req, res) => res.type('text/plain').send('ok'));

app.use(redisSession);

app.use('/auth', authRoutes);
app.use('/youtube', youtubeRoutes);
app.use('/spotify', spotifyRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
