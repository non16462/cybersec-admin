const crypto = require("crypto-js");

const secretKey = 'llovemeloveme';

// Encode (เข้ารหัส)
const my_password = 'mypass';
const encode = crypto.AES.encrypt(my_password, secretKey).toString();
console.log('encode:', encode);

// Decode (ถอดรหัส)
const decode = crypto.AES.decrypt(encode, secretKey).toString(crypto.enc.Utf8);
console.log('decode:', decode);
