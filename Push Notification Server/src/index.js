import * as EpnsAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";
import dotenv from "dotenv";
import { connect } from "@tableland/sdk";
import express from "express";
import * as cron from "node-cron";
// import tableNames from '../databaseConfig.js';
import fetch from 'node-fetch';
dotenv.config();
globalThis.fetch = fetch;

const app = express();

app.use(express.json())
app.post('/notif', async (req, res) => {
    console.log(req);
    console.log(req.body);
    await sendNotification(req.body.recipientAddress, req.body.img)
    res.sendStatus(200);
});


const sendNotification = async (recipientAddress, img) => {
    console.log(recipientAddress, img)
    const epnsPK = `0xca0c0901ef999eab7fb7b041c05f484b428982a5c4297fc3efaaab5e661265c3`;
const signer = new ethers.Wallet(epnsPK);
    try {
        const apiResponse = await EpnsAPI.payloads.sendNotification({
            signer,
            type: 3, // target
            identityType: 2, // direct payload
            notification: {
                title: `[SDK-TEST] notification TITLE:`,
                body: `[sdk-test] notification BODY`
            },
            payload: {
                title: 'Hack Attempted !!',
                body: "Some one trying to hack your wallet do something to protect it!!",
                cta: "https://github.com",
                img: ''
            },
            recipients: `eip155:5:${recipientAddress}`, // recipient address
            channel: 'eip155:5:0xcCc8BB4aFb41De6BDa9fAeA3636aA4D74DaB99d1', // your channel address
            env: 'staging'
        });

        // apiResponse?.status === 204, if sent successfully!
        console.log('API repsonse: ', apiResponse.status);
    } catch (err) {
        console.error('Error: ', err);
    }
}

app.listen(process.env.PORT || 8000, () => {
    console.log("Server listening on port 8000...")
})
