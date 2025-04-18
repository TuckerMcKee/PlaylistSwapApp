function parseYoutubeTitle(title) {
    // Step 1: Handle cases where there's no separator (assume it's only a song title)
    if (!title.match(/[-|–|•]/)) {
        return { artist: null, songTitle: title.trim(), ytTitle:title };
    }

    // Step 2: Enhanced regex to match artist and song title more flexibly
    const regex = /^(.*?)\s*[-|–|•]\s*(.*?)(\(|\[|$)/;

    const match = title.match(regex);

    if (match) {
        let artist = match[1].trim();
        let songTitle = match[2].trim();

        // Step 3: Handle cases where song titles contain a separator
        if (songTitle.includes(" - ")) {
            let possibleTitle = songTitle.split(" - ")[0]; // Take the first part as the song title
            songTitle = possibleTitle.trim();
        }

        // Step 4: Remove featuring/collaboration details from the song title
        songTitle = songTitle.replace(/\(feat\..*?\)/i, "").trim();

        return { artist, songTitle, ytTitle:title };
    }

    return { artist: null, songTitle: null, ytTitle:title };
}

export default parseYoutubeTitle;