import { jest } from '@jest/globals';

const mockGet = jest.fn();
const getTokenMock = jest.fn();

jest.unstable_mockModule('axios', () => ({
  default: {
    get: mockGet,
  },
}));

jest.unstable_mockModule('../helpers/spotifyAuth.js', () => ({
  default: getTokenMock,
}));

jest.unstable_mockModule('../config/index.js', () => ({
  SPOTIFY_API: 'https://api.spotify.com/v1',
}));

const { ensureSpotifyToken, getSpotifyPlaylistSongs } = await import('../controllers/spotifyController.js');

const createMockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('spotifyController', () => {
  let next;

  beforeEach(() => {
    mockGet.mockReset();
    getTokenMock.mockReset();
    next = jest.fn();
  });

  describe('ensureSpotifyToken', () => {
    it('retrieves a new token when one is not stored on the session', async () => {
      const req = { session: {} };
      const res = createMockRes();

      getTokenMock.mockResolvedValue('new-token');

      await ensureSpotifyToken(req, res, next);

      expect(getTokenMock).toHaveBeenCalledTimes(1);
      expect(req.session.spotifyToken).toBe('new-token');
      expect(next).toHaveBeenCalled();
    });

    it('uses the existing token from the session when available', async () => {
      const req = { session: { spotifyToken: 'existing-token' } };
      const res = createMockRes();

      await ensureSpotifyToken(req, res, next);

      expect(getTokenMock).not.toHaveBeenCalled();
      expect(req.session.spotifyToken).toBe('existing-token');
      expect(next).toHaveBeenCalled();
    });

    it('returns a 500 error when token retrieval fails', async () => {
      const req = { session: {} };
      const res = createMockRes();

      const error = new Error('network failure');
      getTokenMock.mockRejectedValue(error);

      await ensureSpotifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get Spotify token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getSpotifyPlaylistSongs', () => {
    it('fetches and normalizes tracks from the Spotify playlist', async () => {
      const req = { params: { playlistId: '37i9dQZF1DXcBWIGoYBM5M' }, session: { spotifyToken: 'token' } };
      const res = createMockRes();

      mockGet.mockResolvedValue({
        data: {
          tracks: {
            items: [
              {
                track: {
                  type: 'track',
                  name: 'Song 1',
                  artists: [{ name: 'Artist 1' }],
                },
              },
              {
                track: {
                  type: 'podcast',
                  name: 'Talk Show',
                  artists: [{ name: 'Host' }],
                },
              },
            ],
          },
        },
      });

      await getSpotifyPlaylistSongs(req, res, next);

      expect(mockGet).toHaveBeenCalledWith('https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M', {
        headers: { Authorization: 'Bearer token' },
      });
      expect(res.json).toHaveBeenCalledWith([
        { songTitle: 'Song 1', artist: 'Artist 1' },
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    it('passes errors to the next middleware when the API call fails', async () => {
      const req = { params: { playlistId: 'bad-id' }, session: { spotifyToken: 'token' } };
      const res = createMockRes();
      const error = new Error('Spotify failure');

      mockGet.mockRejectedValue(error);

      await getSpotifyPlaylistSongs(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});