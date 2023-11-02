const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const crypto = require("crypto");
const { encrypt, decrypt } = require("./utils/cryptoFunc");
const FileSaver = require("file-saver");

contextBridge.exposeInMainWorld("fileEncryption", {
  encryptTextFile: async (filepath, password) => {
    const fileData = fs.readFileSync(filepath);
    const fileExtArr = filepath.split(".");
    const data =
      fileData.toString("base64") +
      "(/:::::/)" +
      fileExtArr[fileExtArr.length - 1];

    return encrypt(crypto, data, password);
  },
  decryptTextFile: async (filepath, password) => {
    const fileData = fs.readFileSync(filepath);
    const data = fileData.toString();

    return decrypt(crypto, data, password);
  },
});

contextBridge.exposeInMainWorld("fileSaving", {
  savingFile: (data, encoding, mimeType, name) => {
    var blob = new Blob([data], { type: encoding });
    FileSaver.saveAs(blob, `${name}.${mimeType}`);
  },
  makingBuffer: (str) => {
    return Buffer.from(str, "base64");
  },
});

contextBridge.exposeInMainWorld("textEncryption", {
  encryptText: async (text, password) => {
    return encrypt(crypto, text, password);
  },
  decryptText: async (text, password) => {
    return decrypt(crypto, text, password);
  },
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
