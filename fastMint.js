require('dotenv').config();
const ethers = require("ethers");
const fs = require('fs');

const nodeUrl = process.env.NODE_URL;
const provider = new ethers.providers.JsonRpcProvider(nodeUrl)

const amount = ethers.utils.parseEther("0", "ether")  // 期望交易金额，单位为wei
const mintStr = process.env.MINT_STR;
// 将字符串转换为UTF-8编码的字节
const utf8Bytes = Buffer.from(mintStr, 'utf-8');
// 将字节转换为十六进制表示的字符串
const hexStr = '0x' + utf8Bytes.toString('hex');
const totalTimes = process.env.NUMBER_OF_TIMES;

// 每次交易都获取实时gas和nonce
async function performTransaction(walletInfo, numberOfTimes) {
    const nonce = await provider.getTransactionCount(walletInfo.address);
    const gasPrice = await provider.getGasPrice();
    const gasEstimate = await provider.estimateGas({
        to: walletInfo.address,
        value: amount,
        data: hexStr,
    });
    let numberOfFinish = totalTimes - numberOfTimes;
    for (let i = 0; i < numberOfTimes; i++) {
        numberOfFinish = numberOfFinish + 1;
        try {
            const transaction = {
                to: walletInfo.address,
                value: amount,
                gasPrice: gasPrice,
                nonce: nonce + numberOfFinish - 1,
                gasLimit: gasEstimate,
                data: hexStr,
            };

            const wallet = new ethers.Wallet(walletInfo.privateKey, provider)
            await wallet.sendTransaction(transaction);
            console.log(`第 ${walletInfo.num} 个地址 ${walletInfo.address} 第 ${numberOfFinish} 次操作成功.`);
        } catch (error) {
            console.error(`第 ${walletInfo.num} 个地址 ${walletInfo.address} 第 ${numberOfFinish} 次操作失败: `, error);
            await performTransaction(walletInfo, totalTimes - numberOfFinish);
        }
    }
}

async function main() {
    let walletData = [];
    try {
        walletData = JSON.parse(fs.readFileSync('evm_wallets.json', 'utf-8'));
    } catch (e) {
        console.log('未找到 evm_wallets.json 文件');
    }

    Promise.all(walletData.map(wallet => performTransaction(wallet, totalTimes)))
        .then(() => {
            console.log("所有操作完成");
        })
        .catch(error => {
            console.error("操作中有错误发生: ", error);
        });
}

main();