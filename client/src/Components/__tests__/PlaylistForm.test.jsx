import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

let currentPlatform = 'spotify';

const { mockNavigate, mockSpotifyHandle, mockYoutubeHandle } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSpotifyHandle: vi.fn(),
  mockYoutubeHandle: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ platform: currentPlatform }),
  };
});

vi.mock('react-spinners', () => ({
  ScaleLoader: ({ loading }) => (loading ? <div data-testid="loader" /> : null),
}));

vi.mock('../../Apis/SpotifyApi', () => ({
  default: {
    handleConversion: (...args) => mockSpotifyHandle(...args),
  },
}));

vi.mock('../../Apis/YoutubeApi', () => ({
  default: {
    handleConversion: (...args) => mockYoutubeHandle(...args),
  },
}));

vi.mock('../LinkBox.jsx', () => ({
  default: ({ link }) => <div data-testid="link-box">{link}</div>,
}));

import PlaylistForm from '../PlaylistForm.jsx';

describe('PlaylistForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    currentPlatform = 'spotify';
  });

  afterEach(() => {
    cleanup();
  });

  const submitUrl = async (url) => {
    if (url !== undefined) {
      fireEvent.change(screen.getByRole('textbox', {name: /playlist URL/i}), { target: { value: url } });
    }
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));
  };

  it('requires a playlist URL before submitting', async () => {
    localStorage.setItem('spotify_token', 'token');

    render(<PlaylistForm />);

    await submitUrl();

    expect(screen.getByText('URL required!')).toBeInTheDocument();
    expect(mockSpotifyHandle).not.toHaveBeenCalled();
  });

  it('processes Spotify conversions and renders results', async () => {
    localStorage.setItem('spotify_token', 'spotify-token');
    const response = {
      spotifyUrl: 'https://open.spotify.com/playlist/new',
      notFound: [{ ytTitle: 'Missing Song' }],
    };
    mockSpotifyHandle.mockResolvedValueOnce(response);

    render(<PlaylistForm />);

    await submitUrl('https://youtube.com/playlist?list=PL123');

    await waitFor(() => {
      expect(mockSpotifyHandle).toHaveBeenCalledWith('https://youtube.com/playlist?list=PL123', 'spotify-token');
    });

    expect(screen.getByTestId('link-box')).toHaveTextContent(response.spotifyUrl);
    expect(screen.getByText(/unable find these on spotify/i)).toBeInTheDocument();
    expect(screen.getByText('Missing Song')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /convert/i })).toHaveClass('spotify-convert-btn');
  });

  it('shows Spotify conversion errors to the user', async () => {
    localStorage.setItem('spotify_token', 'spotify-token');
    mockSpotifyHandle.mockRejectedValueOnce(new Error('Conversion failed'));

    render(<PlaylistForm />);

    await submitUrl('https://youtube.com/playlist?list=PLXYZ');

    expect(await screen.findByText('Conversion failed')).toBeInTheDocument();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('navigates home when the platform is invalid', async () => {
    currentPlatform = 'soundcloud';

    render(<PlaylistForm />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('requires a Spotify token when converting to Spotify', async () => {
    currentPlatform = 'spotify';

    render(<PlaylistForm />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('processes Youtube conversions and renders results', async () => {
    currentPlatform = 'youtube';
    const response = {
      playlistUrl: 'https://youtube.com/playlist?list=NEW',
      notFound: [{ songTitle: 'Track', artist: 'Artist' }],
    };
    mockYoutubeHandle.mockResolvedValueOnce(response);

    render(<PlaylistForm />);

    await submitUrl('https://open.spotify.com/playlist/abc');

    await waitFor(() => {
      expect(mockYoutubeHandle).toHaveBeenCalledWith('https://open.spotify.com/playlist/abc');
    });

    expect(screen.getByTestId('link-box')).toHaveTextContent(response.playlistUrl);
    expect(screen.getByText(/unable find these on youtube/i)).toBeInTheDocument();
    expect(screen.getByText(/track - artist/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /convert/i })).toHaveClass('youtube-convert-btn');
  });
});  
