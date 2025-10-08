//use to parse out artist name from youtube channel names ending with "- Topic"

export function parseArtistName(channelName) {
    if (typeof channelName !== "string") return "";
    return channelName.replace(/\s*-\s*Topic\s*$/i, "");
  }