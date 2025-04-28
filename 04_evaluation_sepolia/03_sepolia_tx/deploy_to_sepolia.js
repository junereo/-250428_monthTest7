import { Web3 } from "web3";
import dotenv from "dotenv";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { console } from "inspector";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../../.env') // 현재 파일 기준 .env 경로 설정
});

const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

const abiPath = path.join(__dirname, '../01_contracts/Counter_sol_Counter.abi');
const bytecodePath = path.join(__dirname, '../01_contracts/Counter_sol_Counter.bin');
const outputPath = path.join(__dirname, 'etherscan_links.txt');

const deploySepolia = async() =>{
    try{
        if(!fs.existsSync(abiPath) || !fs.existsSync(bytecodePath)){
            throw new Error(
                '파일이 없습니다'
            );
        };

        const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const bytecode = '0x' + fs.readFileSync(bytecodePath, 'utf8').trim();
        const account = web3.eth.accounts.privateKeyToAccount(
            process.env.PRIVATE_KEY_SEPOLIA
        );
        const contract = new web3.eth.Contract(abi);
        const deployTx =  contract.deploy({data : bytecode, arguments:[account.address]});
        const gas = await deployTx.estimateGas();
        const gasPrice = await web3.eth.getGasPrice();

        const tx = {
            from: account.address,
            data: deployTx.encodeABI(),
            gas,
            gasPrice,
            chainId: 11155111
        }

        const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('Contract address:', receipt.contractAddress);
        console.log('Transaction hash:', receipt.transactionHash);

        const links = `# Contract Address
        https://sepolia.etherscan.io/address/${receipt.contractAddress}

        # Deployment Transaction
        https://sepolia.etherscan.io/tx/${receipt.transactionHash}
        `;
        fs.writeFileSync(outputPath, links, 'utf8');
        console.log('배포 완료');
    }catch(error){
        console.log(error.message);
    }
}


deploySepolia();