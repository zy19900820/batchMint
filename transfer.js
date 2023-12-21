require('dotenv').config();
const {readFileSync} = require('fs');
const ethers = require("ethers");

const nodeUrl = process.env.NODE_URL;
const provider = new ethers.providers.JsonRpcProvider(nodeUrl)
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider)


// 从json文件获取钱包信息
const wallets = JSON.parse(readFileSync('evm_wallets.json', 'utf-8'));

// 目标地址列表
const toAddresses = wallets.map(wallet => wallet.address);

// 转账金额（以wei为单位）
const amountInWei = ethers.utils.parseEther(process.env.MONEY, "ether") 

// 构建交易对象
const buildTransaction = async (to) => {
    try {
        // 获取实时Gas价格
        const fee = await getGasPrice();

        const nonce = await provider.getTransactionCount(wallet.address)
        // 估算gas限制
        const gasLimit = await provider.estimateGas({
            from: wallet.address,
            to: to,
            value: amountInWei,
        });

        return {
            from: wallet.address,
            to: to,
            value: amountInWei,
            gasPrice: fee,
            gasLimit: gasLimit,
            nonce: nonce,
        };
    } catch (error) {
        throw new Error(`构建交易失败: ${error.message}`);
    }
};

// 获取实时Gas价格
const getGasPrice = async () => {
    try {
        const fee = await provider.getGasPrice()
        
        return fee;
    } catch (error) {
        throw new Error(`获取Gas价格失败: ${error.message}`);
    }
};

// 发送交易
const sendTransaction = async (transaction) => {
    try {
        const receipt = await wallet.sendTransaction(transaction);
        //console.log(receipt)
        return await receipt.wait();
    } catch (error) {
        throw new Error(`发送交易失败: ${error.message}`);
    }
};

// 批量发送交易
const batchSendTransactions = async () => {
    for (const toAddress of toAddresses) {
        const transaction = await buildTransaction(toAddress);
        try {
            const receipt = await sendTransaction(transaction);
            console.log(`交易已发送至 ${toAddress}. 交易哈希: ${receipt.transactionHash}`);
        } catch (error) {
            console.error(`发送交易至 ${toAddress} 失败: ${error.message}`);
        }
    }
};

// 执行批量发送
batchSendTransactions();