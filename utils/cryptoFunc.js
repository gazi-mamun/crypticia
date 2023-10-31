module.exports.encrypt = (crypto, data, password) => {
  const iv = crypto.randomBytes(16);
  const key = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex")
    .substring(0, 32);
  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(Buffer.from(data, "utf-8"));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

module.exports.decrypt = (crypto, data, password) => {
  const [ivAsHex, dataAsHex] = data?.split(":");
  const iv = Buffer.from(ivAsHex, "hex");

  const key = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex")
    .substring(0, 32);

  let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(Buffer.from(dataAsHex, "hex"));

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
