require('dotenv').config();
const ethers = require("ethers");
const fs = require('fs');

// 获取助记词
const mnemonic = process.env.MNEMONIC;
// 需要生成的地址数
const genNum = process.env.GEN_NUM;

//HD wallet
const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)

const wallets = [];

async function getWallets(mnemonic) {
	let basePath = "m/44'/60'/0'/0"
    for (let i = 0; i < genNum; i++) {
        let hdNodeNew = hdNode.derivePath(basePath + "/" + i)
        let walletNew = new ethers.Wallet(hdNodeNew.privateKey)
        console.log(`${i+1} address:${walletNew.address}`)
       console.log("privateKey:", walletNew.privateKey)

        const wallet = {
            num: i + 1,
            address: walletNew.address,
            privateKey: walletNew.privateKey,
        };

       wallets.push(wallet);
    }

    fs.writeFileSync('evm_wallets.json', JSON.stringify(wallets, null, 2));
}

getWallets(mnemonic); //执行函数