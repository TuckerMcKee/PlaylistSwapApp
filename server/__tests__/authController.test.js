import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';

const hashMock = jest.fn();
const compareMock = jest.fn();
const signMock = jest.fn();
const queryMock = jest.fn();

jest.unstable_mockModule('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: hashMock,
    compare: compareMock,
  },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: signMock,
  },
}));

jest.unstable_mockModule('../db/index.js', () => ({
  __esModule: true,
  default: {
    query: queryMock,
  },
}));

jest.unstable_mockModule('../config/index.js', () => ({
  __esModule: true,
  SECRET_KEY: 'test-secret',
}));

const { registerUser, loginUser, getCurrentUser } = await import('../controllers/authController.js');

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

let consoleErrorSpy;

beforeEach(() => {
  hashMock.mockReset();
  compareMock.mockReset();
  signMock.mockReset();
  queryMock.mockReset();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('registerUser', () => {
  it('returns 400 when username or password is missing', async () => {
    const req = { body: { password: 'pass' } };
    const res = createMockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing username or password' });
    expect(hashMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('creates a new user and returns a token', async () => {
    hashMock.mockResolvedValue('hashed-password');
    queryMock.mockResolvedValue({ rows: [{ id: 1, username: 'new-user' }] });
    signMock.mockReturnValue('jwt-token');

    const req = { body: { username: 'new-user', password: 'secret' } };
    const res = createMockResponse();

    await registerUser(req, res);

    expect(hashMock).toHaveBeenCalledWith('secret', 10);
    expect(queryMock).toHaveBeenCalledWith(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      ['new-user', 'hashed-password']
    );
    expect(signMock).toHaveBeenCalledWith({ id: 1, username: 'new-user' }, 'test-secret', {
      expiresIn: '1h',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt-token', user: { id: 1, username: 'new-user' } });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('returns 409 when the username already exists', async () => {
    hashMock.mockResolvedValue('hashed-password');
    const duplicateError = new Error('duplicate');
    duplicateError.code = '23505';
    queryMock.mockRejectedValue(duplicateError);

    const req = { body: { username: 'existing-user', password: 'secret' } };
    const res = createMockResponse();

    await registerUser(req, res);

    expect(hashMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(duplicateError);
  });

  it('returns 500 when an unexpected error occurs', async () => {
    hashMock.mockResolvedValue('hashed-password');
    const dbError = new Error('database failure');
    queryMock.mockRejectedValue(dbError);

    const req = { body: { username: 'user', password: 'secret' } };
    const res = createMockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
  });
});

describe('loginUser', () => {
  it('returns 400 when username or password is missing', async () => {
    const req = { body: { username: 'user' } };
    const res = createMockResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing username or password' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(compareMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the user is not found', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const req = { body: { username: 'missing', password: 'secret' } };
    const res = createMockResponse();

    await loginUser(req, res);

    expect(queryMock).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['missing']);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(compareMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the password does not match', async () => {
    queryMock.mockResolvedValue({
      rows: [{ id: 1, username: 'user', password_hash: 'hashed-password' }],
    });
    compareMock.mockResolvedValue(false);

    const req = { body: { username: 'user', password: 'wrong' } };
    const res = createMockResponse();

    await loginUser(req, res);

    expect(compareMock).toHaveBeenCalledWith('wrong', 'hashed-password');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(signMock).not.toHaveBeenCalled();
  });

  it('returns a token when credentials are valid', async () => {
    queryMock.mockResolvedValue({
      rows: [{ id: 5, username: 'user', password_hash: 'hashed-password' }],
    });
    compareMock.mockResolvedValue(true);
    signMock.mockReturnValue('jwt-token');

    const req = { body: { username: 'user', password: 'correct' } };
    const res = createMockResponse();

    await loginUser(req, res);

    expect(compareMock).toHaveBeenCalledWith('correct', 'hashed-password');
    expect(signMock).toHaveBeenCalledWith({ id: 5, username: 'user' }, 'test-secret', {
      expiresIn: '1h',
    });
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt-token' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 500 when an error occurs during lookup', async () => {
    const dbError = new Error('lookup failed');
    queryMock.mockRejectedValue(dbError);

    const req = { body: { username: 'user', password: 'secret' } };
    const res = createMockResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
  });
});

describe('getCurrentUser', () => {
  it('responds with the user attached to the request', () => {
    const req = { user: { id: 10, username: 'current-user' } };
    const res = createMockResponse();

    getCurrentUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ user: { id: 10, username: 'current-user' } });
  });
});

