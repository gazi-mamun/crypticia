const { app, BrowserWindow } = require("electron");
const path = require("node:path");

// process.env.NODE_ENV = "development";
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV == "development";
const isMac = process.platform === "darwin";

function createMainWindow() {
  const win = new BrowserWindow({
    width: isDev ? 1000 : 350,
    height: 470,
    resizable: false,
    maximizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/icons/icon_512x512.png"),
  });

  // Open devtools if in dev env
  if (isDev) {
    win.webContents.openDevTools();
  }

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "./renderer/html/index.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
