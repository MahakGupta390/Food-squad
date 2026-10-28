export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (err?.name === 'VersionError') {
    return res.status(409).json({ error: 'Someone changed the room at the same time, try again' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}
