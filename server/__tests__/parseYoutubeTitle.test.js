import parseYoutubeTitle from '../helpers/parseYoutubeTitle.js';

describe('parseYoutubeTitle', () => {
  it('extracts artist and title from a basic hyphenated title', () => {
    const result = parseYoutubeTitle('Taylor Swift - Love Story (Official Music Video)');

    expect(result.artist).toBe('Taylor Swift');
    expect(result.songTitle).toBe('Love Story');
  });

  it('handles en dash separators and removes bracket descriptors', () => {
    const result = parseYoutubeTitle('The Weeknd – Blinding Lights [Official Video]');

    expect(result.artist).toBe('The Weeknd');
    expect(result.songTitle).toBe('Blinding Lights');
  });

  it('keeps featured artists that appear in the song portion', () => {
    const result = parseYoutubeTitle('Dua Lipa - Levitating ft. DaBaby (Official Lyric Video)');

    expect(result.artist).toBe('Dua Lipa');
    expect(result.songTitle).toBe('Levitating ft. DaBaby');
  });

  it('keeps featured artists that appear in the artist portion', () => {
    const result = parseYoutubeTitle('Kendrick Lamar ft. SZA - All The Stars (Audio)');

    expect(result.artist).toBe('Kendrick Lamar ft. SZA');
    expect(result.songTitle).toBe('All The Stars');
  });

  it('understands titles formatted as "Song by Artist"', () => {
    const result = parseYoutubeTitle('"Yellow" by Coldplay (Official Video)');

    expect(result.artist).toBe('Coldplay');
    expect(result.songTitle).toBe('Yellow');
  });

  it('parses titles that use other separators such as pipes or bullets', () => {
    const pipeResult = parseYoutubeTitle('Paramore | Hard Times (Official Audio)');
    expect(pipeResult.artist).toBe('Paramore');
    expect(pipeResult.songTitle).toBe('Hard Times');

    const bulletResult = parseYoutubeTitle('Foo Fighters • The Pretender [Lyric Video]');
    expect(bulletResult.artist).toBe('Foo Fighters');
    expect(bulletResult.songTitle).toBe('The Pretender');
  });

  it('decodes HTML entities in the artist portion', () => {
    const result = parseYoutubeTitle('Simon &amp; Garfunkel - The Sound of Silence');

    expect(result.artist).toBe('Simon & Garfunkel');
    expect(result.songTitle).toBe('The Sound of Silence');
  });

  it('removes trailing descriptors that are not part of the song title', () => {
    const result = parseYoutubeTitle('Billie Eilish - Bad Guy Official Visualizer');

    expect(result.artist).toBe('Billie Eilish');
    expect(result.songTitle).toBe('Bad Guy');
  });

  it('prioritizes the song appearing before the artist when appropriate', () => {
    const result = parseYoutubeTitle('Bad Romance - Lady Gaga');

    expect(result.artist).toBe('Lady Gaga');
    expect(result.songTitle).toBe('Bad Romance');
  });

  it('returns null for the artist when no clear separator exists', () => {
    const result = parseYoutubeTitle('Moonlight Sonata (Piano Version)');

    expect(result.artist).toBeNull();
    expect(result.songTitle).toBe('Moonlight Sonata (Piano Version)');
  });

  it('preserves additional song context such as live performance details', () => {
    const result = parseYoutubeTitle('Hozier - Cherry Wine (Live at The Late Show) (Official Video)');

    expect(result.artist).toBe('Hozier');
    expect(result.songTitle).toBe('Cherry Wine (Live at The Late Show)');
  });

  it('supports colon separators when parsing artist and song title', () => {
    const result = parseYoutubeTitle('Sia: Chandelier (Official Music Video)');

    expect(result.artist).toBe('Sia');
    expect(result.songTitle).toBe('Chandelier');
  });
});
