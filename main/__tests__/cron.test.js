/* eslint-env jest */

const { createCron } = require('../cron');
const { activate } = require('../cmd');
const { timeLog } = require('../utils');

jest.mock('../cmd');
jest.mock('../utils');

let window;

beforeEach(() => {
  window = { webContents: { send: jest.fn() } };
});

describe('startJob', () => {
  it('does not start if a task is already running', () => {
    const cron = createCron();
    cron.startJob({ app: 'Foo', activeMins: 1, frequencyMins: 5 }, window);
    expect(activate).toBeCalledTimes(1);
    expect(activate).toBeCalledWith({ app: 'Foo', bg: false });
    expect(timeLog).not.toBeCalledWith('Task is already running!');

    cron.startJob({ app: 'Foo', activeMins: 1, frequencyMins: 5 }, window);
    expect(timeLog).toBeCalledWith('Task is already running!');
    expect(activate).toBeCalledTimes(1);
  });

  it.todo('kicks off job, then runs regularly');
});
