const { Notification } = require('electron');
const cron = require('node-cron');
const { ms, timeLog } = require('./utils');
const { activate, quit } = require('./cmd');

const WARN_SECONDS = 30;
const WARN_MS = WARN_SECONDS * 1000;

const createCron = () => {
  let warnTimeout;
  let closeTimeout;
  let task;

  const prepareClose = ({ app, activeMins }, window) => {
    const notification = new Notification({
      body: `${app} will close in ${WARN_SECONDS} seconds`,
    });

    clearTimeout(closeTimeout);
    closeTimeout = null;

    warnTimeout = setTimeout(() => {
      notification.show();

      closeTimeout = setTimeout(() => {
        closeTimeout = null;
        timeLog(`quitting ${app}...`);
        window.webContents.send('quit');
        quit(app);
      }, WARN_MS);
    }, ms(activeMins) - WARN_MS);
  };

  const moreTime = ({ app, activeMins = 5 }, window) => {
    if (!closeTimeout) {
      return null;
    }
    prepareClose({ app, activeMins }, window);
    window.webContents.send('activate');
    return activeMins;
  };

  const startJob = ({ app, activeMins, frequencyMins, bg = false }, window) => {
    if (activeMins > frequencyMins) {
      throw new Error('Active time cannot be more than frequency');
    }

    if (task && task.isRunning) {
      timeLog('Task is already running!');
      return task;
    }

    timeLog(`Starting ${app}`);
    // const command = `echo "Running ${app}${bg ? ' in the background' : ''}..."`

    // Seems like this doesn't handle fractions, e.g. */0.5
    // I'm also not sure it handles */60 (should be every hour but I think it does every minute)
    const activateCron = `*/${frequencyMins} * * * *`;
    timeLog(`activateCron:`, activateCron);

    activate({ app, bg });
    prepareClose({ app, activeMins }, window);
    window.webContents.send('activate');
    task = cron.schedule(activateCron, () => {
      timeLog(`activating ${app}...`);
      activate({ app, bg });
      prepareClose({ app, activeMins }, window);
      window.webContents.send('activate');
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
      quit(app);
    }
  };

  const startWorkingHours = (data, window) => {
    // TODO: Make these configurable from the frontend
    // TODO: Make these cancelable/changeable
    timeLog(`Scheduling work hours`);
    const stopDay = cron.schedule('1 12,18 * * mon-fri ', () => {
      timeLog(`Shutting down jobs for a while...`);
      stopJob(data.app);
    });

    const startDay = cron.schedule('1 9,14 * * mon-fri ', () => {
      timeLog(`Starting scheduling jobs again!`);
      startJob(data, window);
    });

    stopDay.start();
    startDay.start();

    startJob(data, window);
  };

  return { startJob, stopJob, startWorkingHours, moreTime };
};

module.exports = { createCron };
