import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {render, screen, cleanup, waitFor } from '@testing-library/react';

const { mockNavigate, mockGetSpotifyToken } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockGetSpotifyToken: vi.fn(),
  }));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
});

vi.mock('../../Auth/spotifyAuth', () => {
    return {
        getSpotifyToken: mockGetSpotifyToken,
    }
})

import FetchSpotifyToken from "../FetchSpotifyToken";

describe('FetchSpotifyToken', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    afterEach(() => {
        cleanup();
    })

    it('displays redirecting message', ()=> {
        render(<FetchSpotifyToken/>);

        expect(screen.getByText('Redirecting...')).toBeInTheDocument();

    })

    it('calls getSpotifyToken once and navigates to /playlist/spotify on success', async () => {
        mockGetSpotifyToken.mockResolvedValueOnce(undefined);
        render(<FetchSpotifyToken/>);
        await waitFor(() => {
            expect(mockGetSpotifyToken).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/playlist/spotify');
        });
    });

    it('does not navigate before the token resolves', async () => {
        let resolveFn;
        mockGetSpotifyToken.mockImplementationOnce(() => new Promise((res) => { resolveFn = res; }));
        render(<FetchSpotifyToken/>);
        expect(mockNavigate).not.toHaveBeenCalled();
        resolveFn();
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/playlist/spotify');
        });
    });

    it('navigates to / on token failure and logs an error', async () => {
        const err = new Error('Token exchange failed');
        mockGetSpotifyToken.mockRejectedValueOnce(err);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<FetchSpotifyToken/>);
        await waitFor(() => {
            expect(mockGetSpotifyToken).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('invokes navigation exactly once per outcome', async () => {
        mockGetSpotifyToken.mockResolvedValueOnce(undefined);
        render(<FetchSpotifyToken/>);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/playlist/spotify');
        });

        cleanup();
        vi.clearAllMocks();

        mockGetSpotifyToken.mockRejectedValueOnce(new Error('boom'));
        render(<FetchSpotifyToken/>);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
})