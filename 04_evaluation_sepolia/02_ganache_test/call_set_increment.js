import { Web3 } from "web3";
import dotenv from "dotenv";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../../.env') // 현재 파일 기준 .env 경로 설정
});

const web3 = new Web3('http://127.0.0.1:8545');
const abiPath = path.join(__dirname, '../01_contracts/Counter_sol_Counter.abi');
const contractAddressPath = path.join(__dirname, 'contract_Address.txt');

const callIncrement = async() =>{
    try{
        if(!fs.existsSync(abiPath)){
            throw new Error(
                '파일이 없습니다'
            );
        };

        const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const contractAddress = fs.readFileSync(contractAddressPath, 'utf8').trim();
        const account = web3.eth.accounts.privateKeyToAccount(
            process.env.PRIVATE_KEY
          );

        const contract = new web3.eth.Contract(abi, contractAddress);
        const CurrrentCount = await contract.methods.getCount().call();
        const latestBlock = await web3.eth.getBlock('latest');
        console.log("latestBlock number", latestBlock.number);
        console.log('current count:', CurrrentCount);

        const gas = await contract.methods.increment().estimateGas();
        const gasPrice = await web3.eth.getGasPrice();

        const txInc = {
            from : account.address,
            to: contractAddress,
            data: await contract.methods.increment().encodeABI(),
            gas,
            gasPrice,     
            nonce : await web3.eth.getTransactionCount(account.address, "pending"),
        }

        const signedTx = await web3.eth.signTransaction(txInc, account.privateKey);
        const transaction = await web3.eth.sendSignedTransaction(signedTx.raw);

        console.log('transactionInc hash:', transaction.transactionHash);

        const Countcall = await contract.methods.getCount().call();
        console.log('Incremented count:', Countcall);
    }catch(error){
        console.log(error.message);
    }
}


callIncrement();