const path = require('path');
const { app, screen, BrowserWindow, Tray, ipcMain } = require('electron');
const { createCron } = require('./cron');
const { saveTodos, loadTodos } = require('./db');

const { stopJob, startWorkingHours, moreTime } = createCron();

const assetsDir = path.join(__dirname, '../assets');

let tray;
let window;

app.on('ready', () => {
  // TODO: Don't use T logo
  tray = new Tray(path.join(assetsDir, 'mbta-logo-black.png'));
  const display = screen.getPrimaryDisplay();
  const { width } = display.bounds;
  window = new BrowserWindow({
    x: width - 700,
    y: 0,
    width: 380,
    height: 500,
    show: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.loadURL(`file://${path.join(__dirname, '../public/index.html')}`);
  window.on('blur', window.hide);

  tray.on('click', () => toggleWindow());
  tray.on('double-click', () => window.openDevTools({ mode: 'detach' }));

  window.webContents.on('dom-ready', e => {
    const todos = loadTodos();
    e.sender.send('init-todos', { todos });
  });

  const handleStartJob = data => {
    startWorkingHours(data, window);
    return ['start-success'];
  };

  const handleMoreTime = data => {
    const available = moreTime(data, window);
    return ['more-time-success', { available }];
  };

  const handleStopJob = data => {
    stopJob(data.app);
    return ['stop-success'];
  };

  const handleSaveTodos = data => {
    if (!data.todos) {
      throw new Error('No todos from client');
    }
    saveTodos(data.todos);
    return ['save-success'];
  };

  const handler = fn => (e, data) => {
    try {
      const res = fn(data);
      e.sender.send(...res);
    } catch (err) {
      console.log(`err:`, err);

      const message =
        err.stack.match(/Can’t get application/) && `Not a valid app name`;

      e.sender.send('error', message || err.message);
    }
  };

  ipcMain.on('start-job', handler(handleStartJob));
  ipcMain.on('more-time', handler(handleMoreTime));
  ipcMain.on('stop-job', handler(handleStopJob));
  ipcMain.on('save-todos', handler(handleSaveTodos));
});

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const trayPos = tray.getBounds();
  const windowPos = window.getBounds();
  const x = Math.round(trayPos.x + trayPos.width / 2 - windowPos.width / 2);
  const y = Math.round(trayPos.y + trayPos.height);

  window.setPosition(x, y, false);
  window.show();
  window.focus();
};
