import { jest } from '@jest/globals';

const mockGet = jest.fn();
const mockPost = jest.fn();
const parseYoutubeTitleMock = jest.fn();
const oauth2ClientMock = {
  credentials: { access_token: 'mock-access-token' },
  getToken: jest.fn(),
  setCredentials: jest.fn(),
};

jest.unstable_mockModule('axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

jest.unstable_mockModule('../helpers/parseYoutubeTitle.js', () => ({
  default: parseYoutubeTitleMock,
}));

jest.unstable_mockModule('../helpers/youtubeAuth.js', () => ({
  default: {
    oauth2Client: oauth2ClientMock,
    authorizationUrl: 'https://auth.url',
    state: 'test-state',
  },
}));

jest.unstable_mockModule('../config/index.js', () => ({
  YOUTUBE_API: 'https://youtube.api',
  CLIENT_URL: 'http://client-url',
  YOUTUBE_API_KEY: 'test-key',
}));

const youtubeController = await import('../controllers/youtubeController.js');
const {
  getYoutubePlaylistSongs,
  searchYoutubeSongs,
  createYoutubePlaylist,
  addSongsToYoutubePlaylist,
  getYoutubeAuthUrl,
  handleYoutubeAuthCallback,
} = youtubeController;

const createMockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('youtubeController', () => {
  let next;

  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    parseYoutubeTitleMock.mockReset();
    oauth2ClientMock.getToken.mockReset();
    oauth2ClientMock.setCredentials.mockReset();
    oauth2ClientMock.credentials.access_token = 'mock-access-token';
    next = jest.fn();
  });

  describe('getYoutubePlaylistSongs', () => {
    it('fetches playlist songs and returns parsed data', async () => {
      const req = { params: { playlistId: 'PL123' } };
      const res = createMockRes();
      const titles = ['Artist 1 - Song 1', 'Artist 2 - Song 2'];

      mockGet.mockResolvedValue({
        data: {
          items: titles.map((title) => ({ snippet: { title } })),
        },
      });

      parseYoutubeTitleMock.mockImplementation((title) => ({ parsed: title }));

      await getYoutubePlaylistSongs(req, res, next);

      expect(mockGet).toHaveBeenCalledWith(
        'https://youtube.api/playlistItems?part=snippet&playlistId=PL123&key=test-key'
      );
      expect(parseYoutubeTitleMock).toHaveBeenCalledTimes(titles.length);
      expect(res.json).toHaveBeenCalledWith([
        { parsed: 'Artist 1 - Song 1', artist:'' },
        { parsed: 'Artist 2 - Song 2', artist:'' },
      ]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('searchYoutubeSongs', () => {
    it('returns matching YouTube video IDs and not found songs', async () => {
      const req = {
        body: {
          songData: [
            { songTitle: 'Song A', artist: 'Artist A' },
            { songTitle: 'Song B', artist: 'Artist B' },
          ],
        },
      };
      const res = createMockRes();

      parseYoutubeTitleMock.mockImplementation((title) => {
        if (title === 'Artist A - Song A') {
          return { songTitle: 'Song A', artist: 'Artist A' };
        }
        return { songTitle: 'No Match', artist: 'No Match' };
      });

      mockGet
        .mockResolvedValueOnce({
          data: {
            items: [
              {
                snippet: { title: 'Artist A - Song A' },
                id: { videoId: 'video-1' },
              },
              {
                snippet: { title: 'Another Title' },
                id: { videoId: 'video-2' },
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            items: [
              {
                snippet: { title: 'Different Song' },
                id: { videoId: 'video-3' },
              },
            ],
          },
        });

      await searchYoutubeSongs(req, res, next);

      expect(mockGet).toHaveBeenNthCalledWith(1, 'https://youtube.api/search', {
        params: {
          key: 'test-key',
          q: 'Artist A - Song A',
          part: 'snippet',
          type: 'video',
          limit: 5,
          videoCategoryId: '10',
        },
      });
      expect(mockGet).toHaveBeenNthCalledWith(2, 'https://youtube.api/search', {
        params: {
          key: 'test-key',
          q: 'Artist B - Song B',
          part: 'snippet',
          type: 'video',
          limit: 5,
          videoCategoryId: '10',
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        ytVideoIds: ['video-1'],
        notFound: [{ songTitle: 'Song B', artist: 'Artist B' }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('createYoutubePlaylist', () => {
    it('creates a playlist using the OAuth access token', async () => {
      const req = {};
      const res = createMockRes();

      mockPost.mockResolvedValue({ data: { id: 'new-playlist' } });

      await createYoutubePlaylist(req, res, next);

      expect(mockPost).toHaveBeenCalledWith(
        'https://youtube.api/playlists?part=snippet,status',
        {
          snippet: {
            title: 'New Playlist',
            description: 'Converted using PlaylistSwap',
          },
          status: {
            privacyStatus: 'public',
          },
        },
        {
          headers: {
            Authorization: 'Bearer mock-access-token',
          },
        }
      );
      expect(res.json).toHaveBeenCalledWith('new-playlist');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('addSongsToYoutubePlaylist', () => {
    it('adds each video to the playlist', async () => {
      const req = {
        body: {
          playlistId: 'playlist-123',
          ytVideoIds: ['video-1', 'video-2'],
        },
      };
      const res = createMockRes();

      mockPost
        .mockResolvedValueOnce({ data: { status: 'added-video-1' } })
        .mockResolvedValueOnce({ data: { status: 'added-video-2' } });

      await addSongsToYoutubePlaylist(req, res, next);

      expect(mockPost).toHaveBeenNthCalledWith(1, 'https://youtube.api/playlistItems?part=snippet', {
        snippet: {
          playlistId: 'playlist-123',
          resourceId: {
            kind: 'youtube#video',
            videoId: 'video-1',
          },
        },
      }, {
        headers: {
          Authorization: 'Bearer mock-access-token',
          'Content-Type': 'application/json',
        },
      });

      expect(mockPost).toHaveBeenNthCalledWith(2, 'https://youtube.api/playlistItems?part=snippet', {
        snippet: {
          playlistId: 'playlist-123',
          resourceId: {
            kind: 'youtube#video',
            videoId: 'video-2',
          },
        },
      }, {
        headers: {
          Authorization: 'Bearer mock-access-token',
          'Content-Type': 'application/json',
        },
      });

      expect(res.json).toHaveBeenCalledWith([
        { status: 'added-video-1' },
        { status: 'added-video-2' },
      ]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getYoutubeAuthUrl', () => {
    it('stores the OAuth state in the session and responds with the auth url', async () => {
      const req = { session: {} };
      const res = createMockRes();

      await getYoutubeAuthUrl(req, res, next);

      expect(req.session.state).toBe('test-state');
      expect(res.json).toHaveBeenCalledWith('https://auth.url');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('handleYoutubeAuthCallback', () => {
    it('redirects to the client when an error is present in the callback', async () => {
      const req = { url: '/callback?error=access_denied', session: {} };
      const res = createMockRes();

      await handleYoutubeAuthCallback(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('http://client-url');
      expect(oauth2ClientMock.getToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('redirects to the client root when the state does not match', async () => {
      const req = { url: '/callback?state=wrong-state&code=test-code', session: { state: 'test-state' } };
      const res = createMockRes();

      await handleYoutubeAuthCallback(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('http://client-url/');
      expect(oauth2ClientMock.getToken).not.toHaveBeenCalled();
      expect(oauth2ClientMock.setCredentials).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('exchanges the auth code for tokens and redirects to the playlist page', async () => {
      const req = { url: '/callback?state=test-state&code=test-code', session: { state: 'test-state' } };
      const res = createMockRes();

      oauth2ClientMock.getToken.mockResolvedValue({ tokens: { access_token: 'new-token' } });

      await handleYoutubeAuthCallback(req, res, next);

      expect(oauth2ClientMock.getToken).toHaveBeenCalledWith('test-code');
      expect(oauth2ClientMock.setCredentials).toHaveBeenCalledWith({ access_token: 'new-token' });
      expect(res.redirect).toHaveBeenCalledWith('http://client-url/playlist/youtube');
      expect(next).not.toHaveBeenCalled();
    });
  });
});