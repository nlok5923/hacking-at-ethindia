import { ethers } from "ethers";
import address from './artifacts/address.json';
// import OTP from './artifacts/OTP.json';
import OTPFactory from './artifacts/OTPFactory.json';
import { generateCalldata } from './circuit_js/generate_calldata';

// import Create2Factory from './artifacts/Create2Factory.json'
import { hexConcat, hexlify, hexValue, hexZeroPad } from 'ethers/lib/utils';


// import { EntryPoint, EntryPoint__factory } from '@account-abstraction/contracts'
import { HttpRpcClient } from '@account-abstraction/sdk/dist/src/HttpRpcClient'
import { ERC4337EthersProvider } from '@account-abstraction/sdk'
import { MyWalletApi } from './MyWalletApi'
// import { deployments } from 'hardhat';
import { MyWalletDeployer__factory } from './types/factories'
// import { OTP__factory } from './types/factories/OTP__factory'
import { MyPaymasterApi } from './MyPaymasterApi'
import { MyWallet__factory } from "./dist/types";

/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable eol-last */
/* eslint-disable padded-blocks */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/semi */
import './aa.init'
// import { ethers } from 'hardhat'
import { Signer } from 'ethers'
import {
  EIP4337Manager,
  EIP4337Manager__factory,
  EntryPoint,
  EntryPoint__factory,
  GnosisSafe,
  GnosisSafe__factory,
  SafeProxy4337,
  SafeProxy4337__factory,
  TestCounter,
  TestCounter__factory,
  OTP,
  OTP__factory,
} from './typechain'
// import {
//   AddressZero,
//   createAddress,
//   createAccountOwner, //  new ethers.Wallet(privateKey, ethers.provider)
//   deployEntryPoint,
//   getBalance,
//   HashZero,
//   isDeployed
// } from './testutils'
import { fillAndSign } from './UserOp'
import { defaultAbiCoder, parseEther } from 'ethers/lib/utils'
// import { expect } from 'chai'
import { Create2Factory } from './Create2Factory'
// import { OTP } from "./types";

let factory: ethers.Contract;
let OTP_instance: OTP;
// let ethersSigner;
// let otp: ethers.Contract;

// const ENTRYPOINT_ADDR = '0x2167fA17BA3c80Adee05D98F0B55b666Be6829d6'
// const MY_WALLET_DEPLOYER = address.MyWalletDeployer

// const providerConfig = {
//     entryPointAddress: ENTRYPOINT_ADDR,
//     bundlerUrl: 'https://eip4337-bundler-goerli.protonapp.io/rpc',
//   }

let ethersSigner: Signer
let safeSingleton: GnosisSafe
let owner: Signer
let ownerAddress: string
let proxy: SafeProxy4337
let manager: EIP4337Manager
let entryPoint: EntryPoint
let counter: TestCounter
let proxySafe: GnosisSafe
let safe_execTxCallData: string

export async function deployEntryPoint (): Promise<EntryPoint> {
    const { ethereum } = window;
  
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const create2factory = new Create2Factory(provider)
    const epf = new EntryPoint__factory(await provider.getSigner())
    const addr = await create2factory.deploy(epf.bytecode, 0, process.env.COVERAGE != null ? 20e6 : 8e6)
    return EntryPoint__factory.connect(addr, await provider.getSigner())
  }

export async function connectContract(addr: string) {
    // const {deploy} = deployments;

    

    // const { ethereum } = window;

    // let provider = new ethers.providers.Web3Provider(ethereum);
    // let signer = provider.getSigner();
    // let network = await provider.getNetwork();

    // console.log('signer: ', await signer.getAddress());

    // const entryPoint = EntryPoint__factory.connect(providerConfig.entryPointAddress, provider)

    // const MyWalletDeployer = MyWalletDeployer__factory.connect(MY_WALLET_DEPLOYER, signer)
    // const factoryAddress = MyWalletDeployer.address


    // const ownerAddress = await signer.getAddress();

    // const walletAddress = await MyWalletDeployer.getDeploymentAddress(ENTRYPOINT_ADDR, ownerAddress, 0)

    // console.log('--- end deploying MyWalletDeployer contract ---')

    // const myPaymasterApi = new MyPaymasterApi();

    // const smartWalletAPI = new MyWalletApi({
    //     provider: provider,
    //     entryPointAddress: entryPoint.address,
    //     walletAddress: walletAddress,
    //     owner: signer,
    //     factoryAddress: factoryAddress,
    //     paymasterAPI: myPaymasterApi
    // })

    // console.log('--- Erc4337EthersProvider initialisation ---')

    // const httpRpcClient = new HttpRpcClient(providerConfig.bundlerUrl, providerConfig.entryPointAddress, network.chainId)

    // const aaProvier = await new ERC4337EthersProvider(network.chainId,
    //     providerConfig,
    //     signer,
    //     provider,
    //     httpRpcClient,
    //     entryPoint,
    //     smartWalletAPI
    //   ).init()

    // const aaSigner = aaProvier.getSigner()

    // // const scw = new ethers.ContractFactory(MyWallet__factory.abi, MyWallet__factory.bytecode);

    // console.log('SCW address: ', await aaSigner.getAddress())

    // // const scw = new ethers.Contract(await aaSigner.getAddress(),MyWallet__factory.abi,  aaSigner)

    // otp = OTP__factory.connect(addr, signer)

    // // otp = new ethers.Contract(addr, OTP.abi, signer);

    // otp = otp.connect(aaSigner)

    // console.log("Connect to OTP Contract:", OTP);



    console.log("Started execution !!");

    // const provider = ethers.provider

    safeSingleton = await new GnosisSafe__factory(ethersSigner).deploy()
    entryPoint = await deployEntryPoint()
    console.log("Started execution 1 !!");

    manager = await new EIP4337Manager__factory(ethersSigner).deploy(entryPoint.address)
  
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const privateKey = "temp";
    owner = new ethers.Wallet(privateKey, provider)
    ownerAddress = await owner.getAddress()


    // counter = await new OTP__factory(ethersSigner).deploy()
    console.log("Exntry point address: ", entryPoint.address);

    console.log(safeSingleton.address, manager.address, ownerAddress)

    proxy = await new SafeProxy4337__factory(ethersSigner).deploy(safeSingleton.address, manager.address, ownerAddress)

    console.log(proxy.address)
    proxySafe = GnosisSafe__factory.connect(proxy.address, owner)

    let txn = await ethersSigner.sendTransaction({ to: proxy.address, value: parseEther('0.1') })
    console.log("txn", txn);
    // ig proxy.address is our scw

    // const counter_countCallData = counter.interface.encodeFunctionData('count')
    // safe_execTxCallData = safeSingleton.interface.encodeFunctionData('execTransactionFromModule', [counter.address, 0, counter_countCallData, 0])
    //  const op = await fillAndSign({
    //     sender: proxy.address, // this must be our scw
    //     callGasLimit: 1e6,
    //     callData: safe_execTxCallData
    //   }, owner, entryPoint)
    // console.log('userop', op)
    //   const beneficiary = '0xA8458B544c551Af2ADE164C427a8A4F13A346F2A'
    //   const rcpt = await entryPoint.handleOps([op], beneficiary).then(async r => r.wait())
    //   console.log('gasUsed=', rcpt.gasUsed, rcpt.transactionHash)



}

// export async function setRootAndVerifier(smartWalletAPI: MyWalletApi, aaProvier: ERC4337EthersProvider){

//     const aaSigner = aaProvier.getSigner()

//     const scw = new ethers.ContractFactory(MyWallet__factory.abi, MyWallet__factory.bytecode);

//     let root = localStorage.getItem("MerkleRoot");
    
//     root = root!==null? root: '123'

//     console.log(`root here: ${root}`)
//     console.log(`data: ${scw.interface.encodeFunctionData('setMerkleRootAndVerifier', [root, address.Verifier])}`)

    
//     const op = await smartWalletAPI.createSignedUserOp({
//         target: await aaSigner.getAddress(),
//         data: scw.interface.encodeFunctionData('setMerkleRootAndVerifier', [root, address.Verifier])
//     })
//     console.log("op: ")
//     console.log(op)
//     let tx = await aaProvier.httpRpcClient.sendUserOpToBundler(op)
        
//     console.log(`here`)
//     console.log(tx)
// }

// export async function getAaParams()
// {

//     const { ethereum } = window;

//     let provider = new ethers.providers.Web3Provider(ethereum);
//     let signer = provider.getSigner();
//     let network = await provider.getNetwork();

//     console.log('signer: ', await signer.getAddress());

//     const entryPoint = EntryPoint__factory.connect(providerConfig.entryPointAddress, provider)

//     const MyWalletDeployer = MyWalletDeployer__factory.connect(MY_WALLET_DEPLOYER, signer)
//     const factoryAddress = MyWalletDeployer.address


//     const ownerAddress = await signer.getAddress();

//     const walletAddress = await MyWalletDeployer.getDeploymentAddress(ENTRYPOINT_ADDR, ownerAddress, 0)

//     console.log('--- end deploying MyWalletDeployer contract ---')

//     const myPaymasterApi = new MyPaymasterApi();

//     const smartWalletAPI = new MyWalletApi({
//         provider: provider,
//         entryPointAddress: entryPoint.address,
//         walletAddress: walletAddress,
//         owner: signer,
//         factoryAddress: factoryAddress,
//         paymasterAPI: myPaymasterApi
//     })
//     console.log('--- Erc4337EthersProvider initialisation ---')

//     const httpRpcClient = new HttpRpcClient(providerConfig.bundlerUrl, providerConfig.entryPointAddress, network.chainId)

//     const aaProvier = await new ERC4337EthersProvider(network.chainId,
//         providerConfig,
//         signer,
//         provider,
//         httpRpcClient,
//         entryPoint,
//         smartWalletAPI
//       ).init()

//     const aaSigner = aaProvier.getSigner()

//     return {smartWalletAPI, httpRpcClient, aaProvier}
// }


export async function connectFactory() {
    const { ethereum } = window;

    let provider = new ethers.providers.Web3Provider(ethereum);
    let signer = provider.getSigner();
    console.log('signer: ', await signer.getAddress());

    

    factory = new ethers.Contract(address['OTPFactory'], OTPFactory.abi, signer);

    console.log("Connect to OTPFactory Contract:", OTPFactory);
}

export async function deployOTP(root: BigInt) {

    const { ethereum } = window;

    let provider = new ethers.providers.Web3Provider(ethereum);
    ethersSigner = provider.getSigner()

    await connectFactory();

    // let Tx = await factory.createOTP(address['Verifier'], root);
    // let tx = await Tx.wait();
    // console.log(tx)
    // let deployedAddress = tx.events[0].args.newAddress;

    // @ts-ignore
    OTP_instance = await new OTP__factory(ethersSigner).deploy(address['Verifier'], root);
    localStorage.setItem("OTPaddress", OTP_instance.address);

    return OTP_instance.address;
}

export async function naiveProof(input: Object, amount: string, recepient: string) {
    
    // let {smartWalletAPI, httpRpcClient, aaProvier} = await getAaParams();
    // const aaSigner = aaProvier.getSigner()

    // const scw = new ethers.ContractFactory(MyWallet__factory.abi, MyWallet__factory.bytecode);
    if (localStorage.getItem('OTPaddress')) {
        console.log(`local OTP contract address`)
        console.log(localStorage.getItem('OTPaddress'));
        await connectContract(localStorage.getItem('OTPaddress')!);
    } else {
        throw new Error("No OTP contract address found. Deploy first.");
    }
    console.log(`amount: ${amount} recepient: ${recepient}`)
    let calldata = await generateCalldata(input);
    console.log("calldata")
    console.log(calldata)
    let tx;

    if (calldata) {
        // // here we have tio built userOp
        // console.log(otp.address)
        // console.log(`recepient: ${recepient} amount: ${amount}`)

        // // const nonce = await smartWalletAPI.getNonce();
        // // console.log(`nonce: `)
        // // console.log(`${nonce}`)
        // // const op = await smartWalletAPI.createSignedUserOp({
        // //     target: await aaSigner.getAddress(),
        // //     data: scw.interface.encodeFunctionData('transfer', [recepient, ethers.utils.parseEther(amount)])
        // // })

        // // console.log(`User Operation`)
        // // console.log(op)
    
        // // tx = await aaProvier.httpRpcClient.sendUserOpToBundler(op)
            
        // // console.log(`here`)
        // // console.log(tx)
        // tx = await otp.naiveApproval(calldata[0], calldata[1], calldata[2], calldata[3], recepient, {value: ethers.utils.parseEther(amount)})
        //     .catch((error: any) => {
        //         console.log(error);
        //         let errorMsg;
        //         if (error.reason) {
        //             errorMsg = error.reason;
        //         } else if (error.data.message) {
        //             errorMsg = error.data.message;
        //         } else {
        //             errorMsg = "Unknown error."
        //         }
        //         throw errorMsg;
        //     });
        // @ts-ignore
        const counter_countCallData = OTP_instance.interface.encodeFunctionData('naiveApproval', [calldata[0], calldata[1], calldata[2], calldata[3], recepient, {value: ethers.utils.parseEther(amount)}])
        safe_execTxCallData = safeSingleton.interface.encodeFunctionData('execTransactionFromModule', [counter.address, 0, counter_countCallData, 0])
         const op = await fillAndSign({
            sender: proxy.address, // this must be our scw
            callGasLimit: 1e6,
            callData: safe_execTxCallData
          }, owner, entryPoint)
        console.log('userop', op)
          const beneficiary = '0xA8458B544c551Af2ADE164C427a8A4F13A346F2A'
          const rcpt = await entryPoint.handleOps([op], beneficiary).then(async r => r.wait())
          console.log('gasUsed=', rcpt.gasUsed, rcpt.transactionHash)


    } else {
        throw new Error("Witness generation failed.");
    }
    return tx;
}

// export async function blockTimestampProof(input: Object) {

//     if (localStorage.getItem('OTPaddress')) {
//         console.log(localStorage.getItem('OTPaddress'));
//         await connectContract(localStorage.getItem('OTPaddress')!);
//     } else {
//         throw new Error("No OTP contract address found. Deploy first.");
//     }

//     let calldata = await generateCalldata(input);
//     let tx;

//     if (calldata) {
//         tx = await otp.blockApproval(calldata[0], calldata[1], calldata[2], calldata[3])
//             .catch((error: any) => {
//                 console.log(error);
//                 let errorMsg;
//                 if (error.reason) {
//                     errorMsg = error.reason;
//                 } else if (error.data.message) {
//                     errorMsg = error.data.message;
//                 } else {
//                     errorMsg = "Unknown error."
//                 }
//                 throw errorMsg;
//             });
//     } else {
//         throw new Error("Witness generation failed.");
//     }
//     return tx;
// }