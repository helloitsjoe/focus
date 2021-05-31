const { Notification } = require('electron');
const cron = require('node-cron');
const { cmd, ms, WARNING_TIME } = require('./utils');

let timeout;
let task;

const activate = ({ bg, app }) =>
  `osascript -e '${bg ? 'launch' : 'activate'} app "${app}"'`;

const quit = app => `osascript -e 'quit app "${app}"'`;

const prepareClose = ({ app, activeMins }) => {
  const notification = new Notification({ timeoutType: 'never' });
  return setTimeout(() => {
    notification.body = `${app} will close in 10 seconds`;
    notification.show();
    setTimeout(() => {
      notification.close();
      console.log(`quitting ${app}...`);
      cmd(quit(app));
    }, WARNING_TIME);
  }, ms(activeMins) - WARNING_TIME);
};

const startJob = ({ app, activeMins, frequencyMins, bg = false } = {}) => {
  if (activeMins > frequencyMins) {
    throw new Error('Active time cannot be more than frequency');
  }

  console.log(`Starting ${app}`);
  // const command = `echo "Running ${app}${bg ? ' in the background' : ''}..."`

  // Seems like this doesn't handle fractions, e.g. */0.5
  const activateCron = `*/${frequencyMins} * * * *`;
  console.log(`activateCron:`, activateCron);

  cmd(activate({ app, bg }));
  timeout = prepareClose({ app, activeMins });
  task = cron.schedule(activateCron, () => {
    console.log(`activating ${app}...`);
    cmd(activate({ app, bg }));
    timeout = prepareClose({ app, activeMins });
  });

  task.start();

  // const stop = () => {
  //   task.stop();
  //   clearTimeout(timeout);
  // };

  // const destroy = () => {
  //   task.destroy();
  //   clearTimeout(timeout);
  // };

  // return { ...task, stop, destroy };
  return task;
};

const stopJob = app => {
  console.log(`stopping task ${app}...`);
  if (task) {
    task.stop();
    clearTimeout(timeout);
    cmd(quit(app));
  }
};

module.exports = { startJob, stopJob };
