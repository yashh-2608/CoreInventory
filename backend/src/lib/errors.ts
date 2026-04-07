import { Response } from 'express';

type ErrorWithCode = Error & { code?: string };

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

export const getErrorMessage = (error: unknown, fallback = DEFAULT_MESSAGE) => {
  const candidate = error as ErrorWithCode | undefined;

  if (candidate?.code === 'CONFIG_MISSING_DATABASE_URL') {
    return 'DATABASE_URL is missing. Add it to backend/.env or the project root .env, then restart the backend.';
  }

  if (candidate?.code === 'P1001') {
    return 'Database connection is unavailable right now. Please try again in a moment.';
  }

  if (candidate?.code === 'P2002') {
    return 'That record already exists.';
  }

  if (candidate?.message) {
    return candidate.message;
  }

  return fallback;
};

export const sendServerError = (
  res: Response,
  error: unknown,
  fallback = DEFAULT_MESSAGE,
  status = 500
) => {
  const candidate = error as ErrorWithCode | undefined;
  const resolvedStatus =
    candidate?.code === 'CONFIG_MISSING_DATABASE_URL'
      ? 503
      : candidate?.code === 'P1001'
        ? 503
        : status;
  const message = getErrorMessage(error, fallback);
  const payload = process.env.NODE_ENV === 'development'
    ? { message, detail: `${error}` }
    : { message };

  return res.status(resolvedStatus).json(payload);
};
