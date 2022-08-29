import {
  useAddress,
  useMetamask,
  useSignatureDrop,
  useNetwork,
  useNetworkMismatch,
  ConnectWallet,
 
} from "@thirdweb-dev/react";

import {
  ChainId,
  SignedPayload721WithQuantitySignature,
} from "@thirdweb-dev/sdk";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useState } from "react";


const Home: NextPage = () => {
   const [quantity, setQuantity] = useState(1); // default to 1
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const isMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const signatureDrop = useSignatureDrop(
    "0xE62d775E3Cc91659034dFC3b09a46259D6942c2c"
  );

  async function claim() {
    if (!address) {
      connectWithMetamask();
      return;
    }

    if (isMismatch) {
      switchNetwork?.(ChainId.BinanceSmartChainMainnet);
      return;
    }

    try {
      const tx = await signatureDrop?.claimTo(address, quantity);
      alert(`Succesfully minted NFT!`);
    } catch (error: any) {
      alert(error?.message);
    }
  }

  async function claimWithSignature() {
    if (!address) {
      connectWithMetamask();
      return;
    }

    if (isMismatch) {
      switchNetwork && switchNetwork(ChainId.BinanceSmartChainMainnet);
      return;
    }

    const signedPayloadReq = await fetch(`/api/generate-mint-signature`, {
      method: "POST",
      body: JSON.stringify({
        address: address,
        quantity: quantity,
      }),
    });

    console.log(signedPayloadReq);

    if (signedPayloadReq.status === 400) {
      alert(
        "Looks like you don't own an early access NFT :( You don't qualify for the free mint."
      );
      return;
    } else {
      try {
        const signedPayload =
          (await signedPayloadReq.json()) as SignedPayload721WithQuantitySignature;

        console.log(signedPayload);

        const nft = await signatureDrop?.signature.mint(signedPayload);

        alert(`Succesfully minted NFT!`);
      } catch (error: any) {
        alert(error?.message);
      }
    }
  }

  return (
   
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>Signature Drop</h1>

      <p className={styles.describe}>
        In this example, users who own one of our{" "}
        <a href="https://opensea.io/collection/thirdweb-community">
          Early Access NFTs
        </a>{" "}
        can mint for free using the{" "}
        <a href="https://portal.thirdweb.com/pre-built-contracts/signature-drop#signature-minting">
          Signature Mint
        </a>
        . However, for those who don&apos;t own an Early Access NFT, they can
        still claim using the regular claim function.
      </p>

      {address ? (
        <div className={styles.nftBoxGrid}>
          {/* Mint a new NFT */}
          <p>Quantity</p>
                <div className={styles.quantityContainer}>
                  <button
                    className={`${styles.quantityControlButton}`}
                    onClick={() => setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>

                  <h4>{quantity}</h4>

                  <button
                    className={`${styles.quantityControlButton}`}
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={
                      quantity >= 10
                      
                    }
                  >
                    +
                  </button>
                </div> 
          <div
            className={styles.optionSelectBox}
            role="button"      
            onClick={() => claim()}
          >
            

            
            <h2 className={styles.selectBoxTitle}>Claim NFT</h2>
            <p className={styles.selectBoxDescription}>
              Use the normal <code>claim</code> function to mint an NFT under
              the conditions of the claim phase.
            </p>
          </div>

          <div
            className={styles.optionSelectBox}
            role="button"
            
            onClick={() => claimWithSignature()}
          >
            <img
              src={`/icons/analytics.png`}
              alt="signature-mint"
              className={styles.cardImg}
            />
            <h2 className={styles.selectBoxTitle}>Mint with Signature</h2>
            <p className={styles.selectBoxDescription}>
              Check if you are eligible to mint an NFT for free, by using
              signature-based minting.
            </p>
          </div>
        </div>
      ) : <p>Please Connect Wallet Below</p>} <div className={styles.margintop}><ConnectWallet 
  // Some customization of the button style
  colorMode="light"
        accentColor="#F213A4"
        
/></div> 
    </div> )  
};

export default Home;