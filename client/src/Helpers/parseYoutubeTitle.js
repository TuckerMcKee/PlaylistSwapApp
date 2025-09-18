const TRAILING_DESCRIPTOR_PATTERNS = [
  /\s*(?:[-–—|:•\/]\s*)?\bofficial(?:\s+music)?\s+video\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bofficial\s+audio\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bofficial\s+lyric\s+video\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\blyric\s+video\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\blyrics\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\baudio\s+only\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bfull\s+audio\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bofficial\s+visualizer\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bvisualizer\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bperformance\s+video\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bkaraoke\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bshorts?\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bvertical\s+video\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bpromo\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\btrailer\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bteaser\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bbehind\s+the\s+scenes\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bmaking\s+of\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bsped\s+up\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bslowed\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bbass\s+boosted\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\b8d\s+audio\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bradio\s+edit\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bcolor\s+coded\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\bline\s+distribution\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\btrack\s+video\b\s*$/i,
  /\s*(?:[-–—|:•\/]\s*)?\btrack\s+visualizer\b\s*$/i,
];

const BRACKET_NOISE = [
  'official',
  'official music video',
  'official video',
  'official audio',
  'official lyric video',
  'lyrics',
  'lyric video',
  'visualizer',
  'performance video',
  'karaoke',
  'shorts',
  'promo',
  'trailer',
  'teaser',
  'behind the scenes',
  'making of',
  'sped up',
  'slowed',
  'bass boosted',
  '8d audio',
  'radio edit',
  'color coded',
  'line distribution',
  'track video',
  'audio only',
  'full audio',
  'audio',
];

const SONG_HINT_WORDS = [
  'remix',
  'mix',
  'version',
  'edit',
  'cover',
  'live',
  'session',
  'acoustic',
  'instrumental',
  'karaoke',
  'ost',
  'soundtrack',
  'theme',
  'opening',
  'ending',
  'part',
  'pt',
  'vol',
  'chapter',
  'episode',
  'official',
  'lyrics',
  'lyric',
  'audio',
  'visualizer',
  'prod',
  'remastered',
  'deluxe',
  'bonus',
  'explicit',
  'bootleg',
  'vip',
];

const SONG_THEME_WORDS = [
  'love',
  'heart',
  'baby',
  'tonight',
  'story',
  'dream',
  'night',
  'day',
  'life',
  'world',
  'home',
  'light',
  'dark',
  'time',
  'girl',
  'boy',
  'dance',
  'party',
  'forever',
  'together',
  'alone',
  'beautiful',
  'crazy',
  'broken',
  'found',
  'lost',
  'summer',
  'winter',
  'spring',
  'fall',
  'autumn',
  'christmas',
  'holiday',
  'rain',
  'fire',
  'sky',
  'sun',
  'moon',
  'stars',
  'romance',
  'tears',
  'angel',
  'devil',
  'queen',
  'king',
  'kiss',
  'memory',
  'memories',
  'road',
  'city',
  'again',
  'always',
  'never',
];

const SONG_THEME_REGEXES = SONG_THEME_WORDS.map(
  (word) => new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
);

const FEATURE_REGEX = /(?:feat\.?|ft\.?|featuring)/i;

const ARTIST_HINT_WORDS = [
  'band',
  'orchestra',
  'ensemble',
  'choir',
  'quartet',
  'trio',
  'duo',
  'dj',
  'producer',
  'collective',
  'crew',
  'project',
  'records',
  'recordings',
  'music',
  'entertainment',
  'studios',
  'studio',
  'presents',
  'grupo',
  'banda',
  'symphony',
  'philharmonic',
  'company',
  'gang',
  'boys',
  'girls',
  'kids',
];

const COMMON_FIRST_NAMES = new Set([
  'aaron',
  'abby',
  'abigail',
  'adam',
  'adrian',
  'aidan',
  'alex',
  'alexander',
  'alexandra',
  'alice',
  'alyssa',
  'amanda',
  'amelia',
  'amy',
  'andrew',
  'anna',
  'anthony',
  'aria',
  'ashley',
  'austin',
  'ava',
  'barbara',
  'ben',
  'benjamin',
  'beth',
  'brad',
  'brandon',
  'brayden',
  'brian',
  'brittany',
  'brooke',
  'caitlin',
  'caleb',
  'camila',
  'cameron',
  'caroline',
  'carter',
  'charles',
  'charlie',
  'charlotte',
  'chloe',
  'chris',
  'christian',
  'christina',
  'christopher',
  'claire',
  'cole',
  'colin',
  'connor',
  'daniel',
  'david',
  'dylan',
  'edward',
  'elena',
  'ella',
  'ellie',
  'emily',
  'emma',
  'ethan',
  'eva',
  'evelyn',
  'faith',
  'felix',
  'gabriel',
  'grace',
  'graham',
  'hannah',
  'harry',
  'henry',
  'hunter',
  'ian',
  'isabella',
  'isabelle',
  'jack',
  'jackson',
  'jacob',
  'jade',
  'james',
  'jasmine',
  'jason',
  'jayden',
  'jeremy',
  'jesse',
  'jessica',
  'john',
  'jonah',
  'jordan',
  'joseph',
  'josh',
  'joshua',
  'jude',
  'julia',
  'julian',
  'justin',
  'karen',
  'katherine',
  'katie',
  'kayla',
  'kevin',
  'kim',
  'kyle',
  'lauren',
  'leah',
  'leo',
  'liam',
  'lily',
  'linda',
  'lisa',
  'logan',
  'lucas',
  'lucy',
  'luke',
  'madison',
  'maria',
  'mason',
  'mathew',
  'matthew',
  'maya',
  'megan',
  'mia',
  'micah',
  'michael',
  'michelle',
  'mike',
  'molly',
  'natalie',
  'nathan',
  'nathaniel',
  'nicole',
  'noah',
  'olivia',
  'owen',
  'parker',
  'paul',
  'peter',
  'phoebe',
  'rachel',
  'rebecca',
  'ryan',
  'sam',
  'samantha',
  'samuel',
  'sarah',
  'scarlett',
  'sean',
  'sebastian',
  'sophia',
  'sophie',
  'stella',
  'stephen',
  'steven',
  'summer',
  'thomas',
  'tim',
  'timothy',
  'tyler',
  'victoria',
  'violet',
  'william',
  'zach',
  'zachary',
]);

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

const PRIMARY_SEPARATORS = [' - ', ' – ', ' — ', ' ~ ', ' | ', ' • ', ': '];
const SECONDARY_SEPARATORS = ['-', '–', '—', '|', '•', ':'];

function decodeHtmlEntities(value) {
  return value.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/gi, (match) => {
    const normalized = match.toLowerCase();
    return HTML_ENTITIES[normalized] ?? match;
  });
}

function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function removeBracketNoise(value) {
  const noisePattern = new RegExp(
    `\\b(${BRACKET_NOISE.map((text) => escapeRegex(text)).join('|')})\\b`,
    'i'
  );

  return value.replace(/([\[{\(])([^\]\)\}]*)[\]}\)]/g, (match, open, inner) => {
    const content = inner.trim();
    if (!content) {
      return '';
    }

    if (/(?:feat\.?|ft\.?|featuring)/i.test(content)) {
      return `${open}${content}${matchingBracket(open)}`;
    }

    if (noisePattern.test(content)) {
      return ' ';
    }

    return `${open}${content}${matchingBracket(open)}`;
  });
}

function matchingBracket(open) {
  switch (open) {
    case '(':
      return ')';
    case '[':
      return ']';
    case '{':
      return '}';
    default:
      return '';
  }
}

function stripTrailingDescriptors(value) {
  let current = value;
  let hasChanges = false;

  do {
    hasChanges = false;

    for (const pattern of TRAILING_DESCRIPTOR_PATTERNS) {
      const updated = current.replace(pattern, '');

      if (updated !== current) {
        current = normalizeSpaces(updated);
        hasChanges = true;
      }
    }
  } while (hasChanges);

  return current;
}

function extractByPattern(value) {
  const match = value.match(/^(.*)\s+by\s+(.*)$/i);
  if (match) {
    const songTitle = match[1].trim();
    const artist = match[2].trim();

    if (songTitle && artist) {
      return { artist, songTitle };
    }
  }

  return null;
}

function splitOutsideBrackets(value, separators) {
  for (const separator of separators) {
    const result = splitBySingleSeparator(value, separator);
    if (result) {
      return result;
    }
  }
  return null;
}

function splitBySingleSeparator(value, separator) {
  let depth = 0;
  for (let index = 0; index <= value.length - separator.length; index += 1) {
    const char = value[index];

    if ('([{'.includes(char)) {
      depth += 1;
    } else if (')]}'.includes(char)) {
      depth = Math.max(0, depth - 1);
    }

    if (depth === 0 && value.slice(index, index + separator.length) === separator) {
      const left = value.slice(0, index).trim();
      const right = value.slice(index + separator.length).trim();

      if (left && right) {
        return [left, right];
      }
    }
  }

  return null;
}

function cleanCommon(value) {
  return normalizeSpaces(value.replace(/^["'“”‘’]+|["'“”‘’]+$/g, ''));
}

function cleanArtist(value) {
  const cleaned = cleanCommon(value).replace(/\s+(?:official|topic)$/i, '').trim();
  return cleaned || null;
}

function cleanSong(value) {
  const cleaned = stripTrailingDescriptors(cleanCommon(value)).trim();
  return cleaned || null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countThemeMatches(segment) {
  let matches = 0;
  for (const regex of SONG_THEME_REGEXES) {
    if (regex.test(segment)) {
      matches += 1;
    }
  }
  return matches;
}

function scoreArtist(segment) {
  if (!segment) {
    return -5;
  }

  let score = 0;
  const lower = segment.toLowerCase();
  const words = lower.split(/[^a-z0-9']+/).filter(Boolean);
  const themeMatches = countThemeMatches(lower);

  for (const hint of ARTIST_HINT_WORDS) {
    if (lower.includes(hint)) {
      score += 1;
    }
  }

  if (FEATURE_REGEX.test(segment)) {
    score += 0.5;
  }

  for (const word of words) {
    if (COMMON_FIRST_NAMES.has(word)) {
      score += 1;
    }
  }

  for (const hint of SONG_HINT_WORDS) {
    if (lower.includes(hint)) {
      score -= 1;
    }
  }

  score -= themeMatches * 0.5;

  if (words.length > 6) {
    score -= 1;
  }

  return score;
}

function scoreSong(segment) {
  if (!segment) {
    return -5;
  }

  let score = 0;
  const lower = segment.toLowerCase();
  const themeMatches = countThemeMatches(lower);

  for (const hint of SONG_HINT_WORDS) {
    if (lower.includes(hint)) {
      score += 1;
    }
  }

  if (FEATURE_REGEX.test(segment)) {
    score += 1;
  }

  score += themeMatches * 0.5;

  if (/['"!?]/.test(segment)) {
    score += 1;
  }

  if (/\d/.test(segment)) {
    score += 1;
  }

  if (/(?:records|vevo|topic|channel|network|studios)/.test(lower)) {
    score -= 1;
  }

  return score;
}

function chooseOrientation(left, right) {
  const directScore = scoreArtist(left) + scoreSong(right);
  const swappedScore = scoreArtist(right) + scoreSong(left);

  if (swappedScore > directScore) {
    return { artist: right, song: left };
  }

  return { artist: left, song: right };
}

function parseYoutubeTitle(title) {
  const ytTitle = typeof title === 'string' ? title : '';

  if (typeof title !== 'string') {
    return { artist: null, songTitle: null, ytTitle };
  }

  let working = normalizeSpaces(decodeHtmlEntities(title));

  if (!working) {
    return { artist: null, songTitle: null, ytTitle };
  }

  working = normalizeSpaces(stripTrailingDescriptors(removeBracketNoise(working)));

  const byResult = extractByPattern(working);
  if (byResult) {
    return {
      artist: cleanArtist(byResult.artist),
      songTitle: cleanSong(byResult.songTitle),
      ytTitle,
    };
  }

  let split = splitOutsideBrackets(working, PRIMARY_SEPARATORS);
  if (!split) {
    split = splitOutsideBrackets(working, SECONDARY_SEPARATORS);
  }

  if (!split) {
    return { artist: null, songTitle: cleanSong(working), ytTitle };
  }

  const [leftRaw, rightRaw] = split;
  const [left, right] = [cleanCommon(leftRaw), cleanCommon(rightRaw)];

  const { artist, song } = chooseOrientation(left, right);

  return {
    artist: cleanArtist(artist),
    songTitle: cleanSong(song),
    ytTitle,
  };
}

export default parseYoutubeTitle;
