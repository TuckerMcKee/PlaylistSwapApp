import axios from "axios";
import * as cheerio from "cheerio";
import he from "he";

async function fetchHtml(url) {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });
    return data;
  }
  
function extractSongsArtists(html) {
    const $ = cheerio.load(html);
  
    const rawAttr = $('.js-store').attr('data-content');
    if (!rawAttr) {
      throw new Error('UG js-store data-content not found');
    }

    const decoded = he.decode(rawAttr);
    const store = JSON.parse(decoded);
  
    const tabs = store?.store?.page?.data?.songbook?.tabs || [];
    const items = tabs
      .map((i) => ({
        songTitle: i.tab.song_name ?? null,
        artist: i.tab.artist_name ?? null
      }))
      .filter((x) => x.songTitle && x.artist);
      
    return items;
  }

async function getUguitarSongData(playlistId) {
    try { 
        const baseUrl = 'https://www.ultimate-guitar.com/playlist/shared/'
        const html = await fetchHtml(`${baseUrl}${playlistId}`);
        return extractSongsArtists(html)
    } catch (error) {
        throw new Error('Error fetching Ultimate Guitar Songs');
    }
}

export default getUguitarSongData;
