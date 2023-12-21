require('dotenv').config();
const ethers = require("ethers");
// 获取助记词
const mnemonic = process.env.MNEMONIC;
// 需要生成的地址数
const genNum = process.env.GEN_NUM;

//HD wallet
const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)

async function getInfoByMnemonic(mnemonic) {
	let basePath = "m/44'/60'/0'/0"
    for (let i = 0; i < genNum; i++) {
        let hdNodeNew = hdNode.derivePath(basePath + "/" + i)
        let walletNew = new ethers.Wallet(hdNodeNew.privateKey)
        console.log(`${i+1} address:${walletNew.address}`)
       console.log("privateKey:", walletNew.privateKey)
    }
}

getInfoByMnemonic(mnemonic); //执行函数