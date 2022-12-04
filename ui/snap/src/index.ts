import { OnRpcRequestHandler } from '@metamask/snap-types';
import https from 'https';
async function getFees() {
  const response = await fetch('https://www.etherchain.org/api/gasPriceOracle');
  return response.text();
}

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

export const promptUser = async (
  prompt: string,
  description: string,
  content: string,
): Promise<boolean> => {
  const response: any = await wallet.request({
    method: 'snap_confirm',
    params: [
      {
        prompt,
        description,
        textAreaContent: content,
      },
    ],
  });
  console.log('Prompt user response', response);
  if (response) {
    return response;
  }
  return false;
};
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
      case 'validateAddress': {
        let params: any = request.params;
        let txobj = params[0];
        let _to = txobj.to;
        var postData = JSON.stringify({
          address: _to,
        });
        var options = {
          hostname: 'localhost',
          port: 5000,
          path: '/validata-address',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
          },
        };

        var req = https.request(options, (res) => {
          console.log('statusCode:', res.statusCode);
          console.log('headers:', res.headers);

          res.on('data', (d) => {
            console.log(d);
            promptUser('', '', `Risk is ${res}`).then((approval) => {
              if (approval) {
                return wallet.request({
                  method: 'eth_sendTransaction',
                  params: [txobj],
                });
              } else {
                throw new Error('User Rejected Tx');
              }
            });
          });

          req.on('error', (e) => {
            console.error(e);
          });
        });

        req.write(postData);
        req.end();
        return true;
      }
    default:
      throw new Error('Method not found.');
  }
};
