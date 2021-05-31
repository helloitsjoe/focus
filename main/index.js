const path = require('path');
const { app, BrowserWindow, Tray, ipcMain } = require('electron');

const assetsDir = path.join(__dirname, '../assets');

let tray;
let window;
let timeout;

app.on('ready', () => {
  tray = new Tray(path.join(assetsDir, 'mbta-logo-black.png'));
  window = new BrowserWindow({
    x: 800,
    y: 0,
    width: 380,
    height: 500,
    show: true,
    frame: true,
    resizable: true,
  });

  window.loadURL(`file://${path.join(__dirname, '../public/index.html')}`);
  window.on('blur', window.hide);

  tray.on('click', () => toggleWindow());
  tray.on('double-click', () => window.openDevTools({ mode: 'detach' }));

  // ipcMain.on('hide-window', () => window.hide());

  // ipcMain.on('change-icon', (sender, data) => {
  //   const color = data === 'red' ? 'black' : 'green';
  //   tray.setImage(path.join(assetsDir, `mbta-logo-${color}.png`));
  // });
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
