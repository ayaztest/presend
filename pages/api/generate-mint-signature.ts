import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function generateMintSignature(
  req: NextApiRequest,
  res: NextApiResponse,

) {
  // De-construct body from request
  const { address } = JSON.parse(req.body);
const { quantity } = JSON.parse(req.body);
  // Get the Early Access NFT Edition Drop contract
  const polygonSDK = new ThirdwebSDK("polygon");
  const earlyAccessNfts = polygonSDK.getEditionDrop(
    "0x728a5887e13e34Ac61c554b0Ae45433C2A3ce5A6"
  );

  // Check to see if the wallet address has an early access NFT
  const numTokensInCollection = await earlyAccessNfts.getTotalCount();
  let userHasToken = false;
  // Check each token in the Edition Drop
  for (let i = 0; i < numTokensInCollection.toNumber(); i++) {
    // See if they have the token
    const balance = await earlyAccessNfts.balanceOf(address, i);
    if (balance.toNumber() > 0) {
      userHasToken = true;
      break;
    }
  }

  // Now use the SDK on Goerli to get the signature drop
  const BinanceSmartChainMainnetSDK = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY as string,
    "binance"
  );
  
  const signatureDrop = BinanceSmartChainMainnetSDK.getSignatureDrop(
    "0xE62d775E3Cc91659034dFC3b09a46259D6942c2c"
  );

  // If the user has an early access NFT, generate a mint signature
  if (userHasToken ) {
   const mintSignature = await signatureDrop.signature.generate({
     to: address, // Can only be minted by the address we checked earlier
     quantity: quantity,
     price: parseInt(quantity) < 3 ? "3" : "1", 
    currencyAddress: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    mintStartTime: new Date(0), // now
  })
    res.status(200).json(mintSignature);
  } else {
    res.status(400).json({
      message: "User does not have an early access NFT",
    });
  }
} 


