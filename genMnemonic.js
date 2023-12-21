const ethers = require("ethers");
require("dotenv").config();
const fs = require('fs');

const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(32))
const mnemonicInfo = {
    "mnemonic": mnemonic
}

// 将助记词写入 JSON 文件
fs.writeFileSync('mnemonic.json', JSON.stringify(mnemonicInfo, null, 2));