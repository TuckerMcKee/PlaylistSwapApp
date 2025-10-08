import getUguitarSongData from "../helpers/getUguitarSongData.js";

export const ultimateGuitarSongData = async (req,res,next) => {
    try {
        const playlistId = req.params.playlistId;
        const songData = await getUguitarSongData(playlistId);
        res.json(songData);
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}