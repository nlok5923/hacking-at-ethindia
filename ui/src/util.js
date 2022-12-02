/* global BigInt */

import { buildPoseidon } from "circomlibjs";
import totp from "totp-generator";
import crypto from 'crypto-browserify';
import base32 from 'hi-base32';
import QRCode from 'qrcode';
import {ethers} from 'ethers'

import vrf  from './artifacts/vrf.json'

const urlPrefix = "otpauth://totp/Mumbai Testnet?secret=";
const urlSuffix = "&issuer=InfinitoLabs";

const VRF_ADDRESS = "0x72B47B0450F10D5Bca027C992DC16f144c84819C"

async function generateQRcode(secret) {
    return await QRCode.toDataURL(urlPrefix.concat(secret).concat(urlSuffix));
}

async function generateSecret(signer, length = 20) {
    const randomBuffer = crypto.randomBytes(length);
    // const VRF = new ethers.Contract(VRF_ADDRESS, vrf.VRF_ABI, signer);
    // console.log(VRF);
    // let reqId = await VRF.lastRequestId();
    // console.log(`reqId: ${reqId}`)

    // let st = await VRF.getRequestStatus(reqId)
    // console.log(`st: ${st}`)
    // const tx =  await VRF.requestRandomWords()
    // const randomBuffer = st[1];
    
    // console.log(`randomBuffer: ${randomBuffer}`)
    return base32.encode(randomBuffer).replace(/=/g, '');
}

export async function generateMerkleTree() {
    const { ethereum } = window;

    let provider = new ethers.providers.Web3Provider(ethereum);
    let signer = provider.getSigner();
    const SECRET = await generateSecret(signer);
    console.log(SECRET)
    const uri = await generateQRcode(SECRET);

    const startTime = Math.floor(Date.now() / 30000 - 1) * 30000;

    let poseidon = await buildPoseidon();
    let hashes = [];
    let tokens = {};

    for (let i = 0; i < 2 ** 7; i++) {
        let time = startTime + i * 30000;
        let token = totp(SECRET, { timestamp: time });
        tokens[time] = token;
        hashes.push(poseidon.F.toObject(poseidon([BigInt(time), BigInt(token)])));
    }
    //console.log(tokens);
    //console.log(hashes);

    // compute root
    let k = 0;

    for (let i = 2 ** 7; i < 2 ** 8 - 1; i++) {
        hashes.push(poseidon.F.toObject(poseidon([hashes[k * 2], hashes[k * 2 + 1]])));
        k++;
    }
    let root = hashes[2 ** 8 - 2];
    console.log("Merkle root:", root);

    localStorage.setItem("OTPhashes", hashes);
    localStorage.setItem("MerkleRoot", root);

    let r = localStorage.getItem("MerkleRoot");
    console.log(`fetched root: ${r}`)

    return [uri, SECRET, root];
}

export async function generateInput(otp) {

    let hashes = localStorage.getItem("OTPhashes").split(',').map(BigInt);

    console.log(hashes);

    let poseidon = await buildPoseidon();

    let currentTime = Math.floor(Date.now() / 30000) * 30000;

    let currentNode = poseidon.F.toObject(poseidon([BigInt(currentTime), BigInt(otp)]));
    //console.log(currentNode);

    if (hashes.indexOf(currentNode) < 0) {
        throw new Error("Invalid OTP.");
    }

    let pathElements = [];
    let pathIndex = [];

    for (var i = 0; i < 7; i++) {
        if (hashes.indexOf(currentNode) % 2 === 0) {
            pathIndex.push(0);
            let currentIndex = hashes.indexOf(currentNode) + 1;;
            //console.log(currentIndex);
            pathElements.push(hashes[currentIndex]);
            currentNode = poseidon.F.toObject(poseidon([hashes[currentIndex - 1], hashes[currentIndex]]));
        } else {
            pathIndex.push(1);
            let currentIndex = hashes.indexOf(currentNode) - 1;
            //console.log(currentIndex);
            pathElements.push(hashes[currentIndex]);
            currentNode = poseidon.F.toObject(poseidon([hashes[currentIndex], hashes[currentIndex + 1]]));
        }
    }

    return ({
        "time": currentTime,
        "otp": otp,
        "path_elements": pathElements,
        "path_index": pathIndex
    })
}