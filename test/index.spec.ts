import { Advenir } from '../src';

const itif = (condition: boolean) => (condition ? it : it.skip);
const prod = itif(
  (process.env.ADVENIR_USERNAME?.length ?? 0) > 0 &&
    (process.env.ADVENIR_PASSWORD?.length ?? 0) > 0,
);

describe('index', () => {
  describe('Advenir', () => {
    it.skip('should alert about already sent transactions', async () => {
      const userId = 'a6d0e6cf-7cac-477a-ae63-7e753c5bdda1';
      const username = '100@servtest.advenir.mobi';
      const password = 'test123';
      const client = new Advenir(userId, username, password, true);

      const response = await client.sendOperation([
        {
          id: 'R3201',
          operations: [
            {
              id: '545457',
              startAt: new Date('2020-02-12 11:01:25 GMT'),
              stopAt: new Date('2020-02-12 12:11:01 GMT'),
              totalEnergyWh: 3317,
            },
            {
              id: '545468',
              startAt: new Date('2019-02-12 11:01:25 GMT'),
              stopAt: new Date('2019-02-12 12:11:01 GMT'),
              totalEnergyWh: 1107,
            },
          ],
        },
      ]);

      expect(response).toEqual([
        expect.objectContaining({
          code: 202,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          transaction: expect.objectContaining({
            id: '545457',
            stationId: 'R3201',
            userId: userId,
          }),
        }),
        expect.objectContaining({
          code: 202,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          transaction: expect.objectContaining({
            id: '545468',
            stationId: 'R3201',
            userId: userId,
          }),
        }),
      ]);
    });

    prod(
      'get bonuses should work',
      async () => {
        const userId = 'a6d0e6cf-7cac-477a-ae63-7e753c5bdda1';
        const username = process.env.ADVENIR_USERNAME;
        const password = process.env.ADVENIR_PASSWORD;
        if (!username || !password) {
          throw new Error('Missing credentials');
        }
        const client = new Advenir(userId, username, password, false);

        const bonuses = client.findAllBonuses();
        for await (const bonus of bonuses) {
          console.log(bonus.id, bonus.reference, bonus.step);
        }
      },
      10_000,
    );
  });
});
