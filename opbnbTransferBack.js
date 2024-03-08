require('dotenv').config();
const ethers = require("ethers");
const fs = require('fs');

const nodeUrl = process.env.NODE_URL;
const provider = new ethers.providers.JsonRpcProvider(nodeUrl)

// 每次交易都获取实时gas和nonce
async function performTransaction(walletInfo) {
        try {
            const wallet = new ethers.Wallet(walletInfo.privateKey, provider)
            const balance = await provider.getBalance(wallet.address)

            const nonce = await provider.getTransactionCount(walletInfo.address);

            const gasPrice = await provider.getGasPrice();
            const gasEstimate = await provider.estimateGas({
                to: process.env.ADDRESS
            });

            const transaction = {
                to: process.env.ADDRESS,
                value: balance.sub(gasPrice.mul(gasEstimate)),
                //value: balance.sub(gasPrice.mul(gasEstimate)).sub(ethers.utils.parseUnits("6000", "gwei")),
                gasPrice: gasPrice,
                nonce: nonce,
                gasLimit: gasEstimate,
            };

            console.log(transaction)

            const receipt = await wallet.sendTransaction(transaction);
            //console.log(receipt)
            const result =  await receipt.wait();
            console.log(`转账成功交易哈希: ${result.transactionHash} `);
        } catch (error) {
            throw new Error(`发送交易失败: ${error.message}`);
        }
}

async function main() {
    let walletData = [];
    try {
        walletData = JSON.parse(fs.readFileSync('evm_wallets.json', 'utf-8'));
    } catch (e) {
        console.log('未找到 evm_wallets.json 文件');
    }

    Promise.all(walletData.map(wallet => performTransaction(wallet)))
        .then(() => {
            console.log("所有操作完成");
        })
        .catch(error => {
            console.error("操作中有错误发生: ", error);
        });
}

main();