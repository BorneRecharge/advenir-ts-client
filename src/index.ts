import {
  OperationBody,
  OperationError,
  OperationErrors,
  OperationResponse,
  Station,
  TransactionReference,
} from './types';
import { chunks } from './utils';

type Dict<T> = {
  [id: string]: T;
};

const associate = <T, U>(
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

const toOperationBody = (
  userId: string,
  stations: Station[],
): OperationBody => {
  const operationStations = associate(
    stations,
    (station) => station.id,
    (station) =>
      associate(
        station.operations,
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
    username: string,
    password: string,
    isTest: boolean = false,
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
}
