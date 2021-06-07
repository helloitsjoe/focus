const path = require('path');
const { app, BrowserWindow, Tray, ipcMain } = require('electron');
const { stopJob, startWorkingHours, moreTime } = require('./cron');
const { saveTodos, loadTodos } = require('./db');

const assetsDir = path.join(__dirname, '../assets');

let tray;
let window;

app.on('ready', () => {
  // TODO: Don't use T logo
  tray = new Tray(path.join(assetsDir, 'mbta-logo-black.png'));
  window = new BrowserWindow({
    x: 800,
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
  // window.on('blur', window.hide);

  tray.on('click', () => toggleWindow());
  tray.on('double-click', () => window.openDevTools({ mode: 'detach' }));

  window.webContents.on('dom-ready', e => {
    const todos = loadTodos();
    e.sender.send('init-todos', { todos });
  });

  ipcMain.on('start-job', (e, data) => {
    try {
      startWorkingHours(data);
      e.sender.send('start-success');
    } catch (err) {
      console.log(`err:`, err);
      const message =
        err.stack.match(/Can’t get application/) &&
        `${data.app} is not a valid app name`;

      e.sender.send('error', message || err);
    }
  });

  ipcMain.on('more-time', (e, data) => {
    try {
      const available = moreTime(data);
      e.sender.send('more-time-success', { available });
    } catch (err) {
      console.log(`err:`, err);
      e.sender.send('error', err.message);
    }
  });

  ipcMain.on('stop-job', (e, { app }) => {
    try {
      stopJob(app);
      e.sender.send('stop-success');
    } catch (err) {
      console.log(`err:`, err);
      e.sender.send('error', err.message);
    }
  });

  ipcMain.on('save-todos', (e, data) => {
    try {
      if (!data.todos) {
        throw new Error('No todos from client');
      }
      saveTodos(data.todos);
      // e.sender.send('save-success');
    } catch (err) {
      console.log(`err:`, err);
      e.sender.send('error', err.message);
    }
  });
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
