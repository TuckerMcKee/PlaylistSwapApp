import express from 'express';
import { ultimateGuitarSongData } from '../controllers/ultimateguitarController.js';

const router = new express.Router();

router.get('/:playlistId', ultimateGuitarSongData);

export default router;

