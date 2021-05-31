const { cmd } = require('./utils');
const cron = require('node-cron');

let timeout;
let task;

const activate = ({ bg, app }) =>
  `osascript -e '${bg ? 'launch' : 'activate'} app "${app}"'`;

const quit = app => `osascript -e 'quit app "${app}"'`;

const startJob = ({ app, activeMins, frequencyMins, bg = false } = {}) => {
  console.log(`Starting ${app}`);
  // const command = `echo "Running ${app}${bg ? ' in the background' : ''}..."`

  // Seems like this doesn't handle fractions, e.g. */0.5
  const activateCron = `*/${frequencyMins} * * * *`;
  console.log(`activateCron:`, activateCron);

  cmd(activate({ app, bg }));
  task = cron.schedule(activateCron, () => {
    console.log(`activating ${app}...`);
    cmd(activate({ app, bg }));
    timeout = setTimeout(() => {
      console.log(`quitting ${app}...`);
      cmd(quit(app));
    }, activeMins * 60 * 1000);
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
