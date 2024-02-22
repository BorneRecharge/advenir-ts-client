import {
  Bonus,
  BonusPage,
  OperationBody,
  OperationError,
  OperationErrors,
  OperationResponse,
  Station,
  TransactionReference,
} from './types';
import { associate, chunks, extractCookie, extractFromBody } from './utils';

const toOperationBody = (
  userId: string,
  stations: Station[],
): OperationBody => {
  const operationStations = associate(
    stations,
    (station) => station.id,
    (station) =>
      associate(
        station.operations.sort(
          (a, b) => b.startAt.getTime() - a.startAt.getTime(),
        ),
        (operation) => operation.id,
        (operation) => {
          return {
            StartTransaction: Math.round(operation.startAt.getTime() / 1_000),
            StopTransaction: Math.round(operation.stopAt.getTime() / 1_000),
            StartValue: 0,
            StopValue: Math.round(operation.totalEnergyWh),
          };
        },
      ),
  );
  return {
    [userId]: operationStations,
  };
};

const extractTransactionReferences = (
  body: OperationBody,
): Map<string, TransactionReference> => {
  const result = new Map<string, TransactionReference>();
  for (const [userId, user] of Object.entries(body)) {
    for (const [stationId, station] of Object.entries(user)) {
      for (const [transactionId, transaction] of Object.entries(station)) {
        result.set(
          `${transaction.StartTransaction}${transaction.StopTransaction}`,
          {
            id: transactionId,
            stationId,
            userId,
          },
        );
      }
    }
  }
  return result;
};

const extractDetails = (
  operationResponse: OperationResponse,
  transactionReferences: Map<string, TransactionReference>,
) => {
  const errors: OperationError[] = [];
  for (const [key, value] of Object.entries(operationResponse.details)) {
    const errorCode = Number(key);
    if (value) {
      for (const [start, stop] of chunks(value, 2)) {
        // Due to API format, 2 different errors can have the same transaction reference
        const transaction = transactionReferences.get(`${start}${stop}`);
        errors.push({
          code: errorCode,
          description: OperationErrors[errorCode],
          transaction,
        });
      }
    } else {
      errors.push({
        code: errorCode,
        description: OperationErrors[errorCode],
      });
    }
  }
  return errors;
};

const ADVENIR_PRODUCTION_URL = 'https://mon.advenir.mobi/api/operation/put';
const ADVENIR_TEST_URL = 'https://test.advenir.mobi/api/operation/put';

export class Advenir {
  private readonly url: string;
  private readonly basicAuthToken: string;

  constructor(
    private readonly userId: string,
    private readonly username: string,
    private readonly password: string,
    private readonly isTest: boolean = false,
  ) {
    this.url = isTest ? ADVENIR_TEST_URL : ADVENIR_PRODUCTION_URL;
    this.basicAuthToken = Buffer.from(`${username}:${password}`).toString(
      'base64',
    );
  }

  public async sendOperation(stations: Station[]): Promise<OperationError[]> {
    const body = toOperationBody(this.userId, stations);

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.basicAuthToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const body = await response.text();
      if (body.length > 0) {
        throw new Error(`Failed to send operation: ${body}`);
      } else {
        throw new Error(`Failed to send operation: ${response.status}`);
      }
    }

    const operationResponse = (await response.json()) as OperationResponse;
    const references = extractTransactionReferences(body);

    if (operationResponse.statut === 'OK') {
      return extractDetails(operationResponse, references);
    }

    return Promise.reject(extractDetails(operationResponse, references));
  }

  public async *findAllBonuses(pageSize: number = 200): AsyncGenerator<Bonus> {
    const { csrfToken, csrfMiddlewareToken } = await this.first();
    const { sessionId, csrfToken: csrfToken2 } =
      await this.identificationRequest(
        csrfToken,
        csrfMiddlewareToken,
        this.username,
        this.password,
      );
    const pageIndex = 1;
    let url: string | null =
      `https://backend-api.mon.advenir.mobi/demande-de-prime/api/bonus_requests/?page=${pageIndex}&page_size=${pageSize}`;
    do {
      const page = await this.getPage(sessionId, csrfToken2, url);
      url = page.next;
      for (const bonus of page.results) {
        yield bonus;
      }
    } while (url);
  }

  private getPage = async (
    sessionId: string,
    csrfToken: string,
    url: string,
  ): Promise<BonusPage> => {
    if (this.isTest) {
      throw new Error('Not available in test mode');
    }
    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Cookie', `sessionid=${sessionId};csrftoken=${csrfToken}`);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };

    return fetch(url, requestOptions).then((response) =>
      response.json(),
    ) as Promise<BonusPage>;
  };

  private first = async () => {
    const response = await fetch('https://mon.advenir.mobi/identification/');
    const csrfToken = extractCookie(response, 'csrftoken');
    if (!csrfToken) {
      throw new Error('csrftoken not found');
    }
    const csrfMiddlewareToken = await extractFromBody(
      response,
      '#loginForm > input[name="csrfmiddlewaretoken"]',
    );
    if (!csrfMiddlewareToken) {
      throw new Error('csrfmiddlewaretoken not found');
    }
    return {
      csrfToken,
      csrfMiddlewareToken,
    };
  };

  private identificationRequest = async (
    csrftoken: string,
    csrfMiddlewareToken: string,
    username: string,
    password: string,
  ) => {
    const myHeaders = new Headers();
    myHeaders.append('cookie', 'csrftoken=' + csrftoken);
    myHeaders.append('referer', 'https://mon.advenir.mobi/identification/');
    myHeaders.append('content-type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('csrfmiddlewaretoken', csrfMiddlewareToken);
    urlencoded.append('username', username);
    urlencoded.append('password', password);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'manual' as RequestRedirect,
    };
    const response = await fetch(
      'https://mon.advenir.mobi/identification/',
      requestOptions,
    );
    const sessionId = extractCookie(response, 'Secure, sessionid');
    if (!sessionId) {
      throw new Error('sessionid not found');
    }
    const csrfToken = extractCookie(response, 'csrftoken');
    if (!csrfToken) {
      throw new Error('csrftoken not found');
    }
    return {
      sessionId,
      csrfToken,
    };
  };
}
