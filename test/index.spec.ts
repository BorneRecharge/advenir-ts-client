import { Advenir } from '../src';

describe('index', () => {
  describe('Advenir', () => {
    it('should alert about already sent transactions', async () => {
      const username = '100@servtest.advenir.mobi';
      const password = 'test123';
      const client = new Advenir(username, password, true);

      const userId = 'a6d0e6cf-7cac-477a-ae63-7e753c5bdda1';
      const response = await client.sendOperation(userId, [
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
  });
});
