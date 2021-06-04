const { Notification } = require('electron');
const cron = require('node-cron');
const { cmd, ms, timeLog } = require('./utils');

let warnTimeout;
let closeTimeout;
let task;

const WARN_SECONDS = 30;
const WARN_MS = WARN_SECONDS * 1000;
const FIVE_MINS = 5 * 60 * 1000;

const activate = ({ bg, app }) =>
  `osascript -e '${bg ? 'launch' : 'activate'} app "${app}"'`;

const quit = app => `osascript -e 'quit app "${app}"'`;

const prepareClose = ({ app, activeMins }) => {
  const notification = new Notification({
    body: `${app} will close in ${WARN_SECONDS} seconds`,
  });

  warnTimeout = setTimeout(() => {
    clearTimeout(warnTimeout);
    clearTimeout(closeTimeout);
    closeTimeout = null;

    notification.show();

    closeTimeout = setTimeout(() => {
      timeLog(`quitting ${app}...`);
      cmd(quit(app));
    }, WARN_MS);
  }, ms(activeMins) - WARN_MS);
};

const moreTime = ({ app, ms = FIVE_MINS }) => {
  if (!closeTimeout) {
    return null;
  }
  clearTimeout(closeTimeout);
  closeTimeout = setTimeout(() => {
    clearTimeout(closeTimeout);
    closeTimeout = null;
    timeLog(`quitting ${app}...`);
    cmd(quit(app));
  }, ms);
  return ms;
};

const startJob = ({ app, activeMins, frequencyMins, bg = false } = {}) => {
  if (activeMins > frequencyMins) {
    throw new Error('Active time cannot be more than frequency');
  }

  if (task && task.isRunning) {
    timeLog('Task is already running!');
  }

  timeLog(`Starting ${app}`);
  // const command = `echo "Running ${app}${bg ? ' in the background' : ''}..."`

  // Seems like this doesn't handle fractions, e.g. */0.5
  // I'm also not sure it handles */60 (should be every hour but I think it does every minute)
  const activateCron = `*/${frequencyMins} * * * *`;
  timeLog(`activateCron:`, activateCron);

  cmd(activate({ app, bg }));
  prepareClose({ app, activeMins });
  task = cron.schedule(activateCron, () => {
    timeLog(`activating ${app}...`);
    cmd(activate({ app, bg }));
    prepareClose({ app, activeMins });
  });

  task.start();
  task.isRunning = true;
  return task;
};

const stopJob = app => {
  timeLog(`stopping task ${app}...`);
  if (task) {
    task.stop();
    task.isRunning = false;
    clearTimeout(warnTimeout);
    cmd(quit(app));
  }
};

const startWorkingHours = data => {
  // TODO: Make these configurable from the frontend
  // TODO: Make these cancelable/changeable
  timeLog(`Scheduling work hours`);
  const stopDay = cron.schedule('1 12,18 * * mon-fri ', () => {
    timeLog(`Shutting down jobs for a while...`);
    stopJob(data.app);
  });

  const startDay = cron.schedule('1 9,14 * * mon-fri ', () => {
    timeLog(`Starting scheduling jobs again!`);
    startJob(data);
  });

  stopDay.start();
  startDay.start();

  startJob(data);
};

module.exports = { startJob, stopJob, startWorkingHours, moreTime };
