
function removeThe(str) {
    if (str.toLowerCase().slice(0,4) === 'the ') {
        return str.slice(3);
    }
    return str
}
//replaces all accented characters with normalized counterparts
//and removes non-alphabet characters for strings matching
//for artist names, also removes leading "The " and anything in parentheses
//song data from spotify search should be title1 and artist1
function matchSongData(title1,artist1,title2,artist2) {
    const cleanTitle1 = title1.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-zA-Z]/g, '');
    const cleanTitle2 = title2.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-zA-Z]/g, '');
    const cleanArtist1 = removeThe(artist1).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s*\(.*?\)\s*/g, "").replace(/[^a-zA-Z]/g, '');
    const cleanArtist2 = removeThe(artist2).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s*\(.*?\)\s*/g, "").replace(/[^a-zA-Z]/g, '');
    const isSameTitle = cleanTitle1 === cleanTitle2 || cleanTitle1.includes(cleanTitle2);
    const isSameArtist = cleanArtist1 === cleanArtist2;
    return isSameTitle && isSameArtist
}

export default matchSongData;