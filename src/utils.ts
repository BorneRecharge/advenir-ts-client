import * as cheerio from 'cheerio';

export function* chunks<T>(arr: T[], chunkSize: number): Generator<T[]> {
  if (chunkSize < 1) throw new Error('Invalid chunk size');
  for (let i = 0; i < arr.length; i += chunkSize) {
    yield arr.slice(i, i + chunkSize);
  }
}

export type Dict<T> = {
  [id: string]: T;
};

export const associate = <T, U>(
  values: T[],
  id: (value: T) => string,
  map: (value: T) => U,
): Dict<U> =>
  Object.assign(
    {},
    ...values.map((value) => ({
      [id(value)]: map(value),
    })),
  ) as Dict<U>;

export function extractCookie(
  response: Response,
  name: string,
): string | undefined {
  const cookie = response.headers
    .get('set-cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(name));
  if (!cookie) {
    return cookie;
  }
  const [cookieName, cookieValue] = cookie.split('=');
  if (cookieName !== name) {
    throw new Error(`${name} not found`);
  }
  return cookieValue;
}

export async function extractFromBody(
  response: Response,
  selector: string,
): Promise<string | undefined> {
  const body = await response.text();
  const $ = cheerio.load(body);
  return $(selector).attr('value');
}
