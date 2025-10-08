const parseUgPlaylistId = (url) => {
    try {
        const u = new URL(url);
        const parts = u.pathname.split('/');
        return parts.pop()
    } catch (error) {
        throw new Error('Invalid Ultimate Guitar Url')
    }
}

export default parseUgPlaylistId;