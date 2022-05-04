import React, { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Buffer } from "buffer";
import { createWidget } from "@typeform/embed";
import PictureImg from "@site/static/img/picture-48.png";
import FormPicture from "@site/static/img/form-48.png";
import LoaderImg from "@site/static/img/loading-circle.gif";
import "./nft-minting.css";
import "@typeform/embed/build/css/widget.css";

const stdMarginBottom = "40px";

const network = "ithacanet";
const rpcUrl = {
  ithacanet: "https://ithacanet.ecadinfra.com/",
  mainnet: "https://mainnet.api.tez.ie"
};
const CONTRACT_ADDRESS = {
  ithacanet: "KT1PK9Bq7dDhvpbhk4zTKizHCiB4AdCKdjt2",
  mainnet: ""
};

export default function NftMinting() {
  const [Tezos, setTezos] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [userAddress, setUserAddress] = useState(undefined);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState("unmounted");
  const [minting, setMinting] = useState(false);
  const [alreadyMinted, setAlreadyMinted] = useState(false);

  const walletOptions = {
    name: "Taqueria NFT",
    preferredNetwork: network
  };

  const connectWallet = async () => {
    let w;
    if (!wallet) {
      w = new BeaconWallet(walletOptions);
      setWallet(w);
    } else {
      w = wallet;
    }

    try {
      await w.requestPermissions({
        network: {
          type: network,
          rpcUrl: rpcUrl[network]
        }
      });
      const userAddress = await w.getPKH();
      setUserAddress(userAddress);
      Tezos.setWalletProvider(w);
    } catch (err) {
      console.error("Unable to connect wallet");
      console.error(err);
    }
  };

  const disconnectWallet = async () => {
    await wallet.clearActiveAccount();
    setWallet(undefined);
    setUserAddress(undefined);
  };

  const createForm = () => {
    createWidget("ke0YM9RA", {
      container: document.querySelector("#nft-form-frame"),
      height: 500,
      hideHeaders: true,
      onSubmit: event => {
        if (event && event.hasOwnProperty("response_id")) {
          setFormSubmitted(true);
        }
      }
    });
  };

  const mint = async () => {
    if (formSubmitted) {
      // form was submitted
      setMinting(true);
      const contract = await Tezos.wallet.at(CONTRACT_ADDRESS[network]);
      try {
        const op = await contract.methods.mint().send();
        await op.confirmation();
        setAlreadyMinted(true);
      } catch (error) {
        console.error(error);
      } finally {
        setMinting(false);
      }
    } else {
      // form was not submitted
      document.querySelector("#nft-form-frame").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  useEffect(() => {
    window.Buffer = Buffer;
    (async () => {
      const tezos = new TezosToolkit(rpcUrl[network]);
      const wallet = new BeaconWallet(walletOptions);
      setWallet(wallet);
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        const userAddress = await wallet.getPKH();
        setUserAddress(userAddress);
        tezos.setWalletProvider(wallet);
      }
      setTezos(tezos);
    })();
    setTimeout(() => {
      // the element needs a few milliseconds to mount
      if (
        document.getElementById("nft-form-frame") &&
        widgetStatus === "unmounted"
      ) {
        setWidgetStatus("mounted");
        createForm();
      }
    }, 200);
  }, []);

  useEffect(() => {
    (async () => {
      if (Tezos && userAddress && alreadyMinted === false) {
        // checks if user hasn't already minted their NFT
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS[network]);
        const storage = await contract.storage();
        const nft = await storage.ledger.get({ 0: userAddress, 1: 0 });
        if (nft) {
          setAlreadyMinted(true);
        } else {
          setAlreadyMinted(false);
          if (widgetStatus === "unmounted") {
            createForm();
          }
        }
      }
    })();
  }, [Tezos, userAddress]);

  useEffect(() => {
    (async () => {
      if (formSubmitted && !alreadyMinted) {
        await mint();
      }
    })();
  }, [formSubmitted]);

  return (
    <div className="nft-minting-page">
      <img
        style={{
          marginBottom: stdMarginBottom
        }}
        src="https://source.unsplash.com/6WHl6T-fxU0"
      />
      <p
        style={{
          marginBottom: stdMarginBottom
        }}
      >
        Mint your NFT to be a part of the launch of Taqueria, the developer tool
        suite for Tezos.
      </p>
      {userAddress && !alreadyMinted && (
        <>
          <span id="nft-form-frame-to-scroll" />
          <div id="nft-form-frame" style={{ marginBottom: stdMarginBottom }} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "20px",
              marginBottom: stdMarginBottom
            }}
          >
            <button onClick={mint}>
              {minting ? (
                <>
                  <img
                    src={LoaderImg}
                    alt="loader"
                    style={{ width: "22px", height: "22px" }}
                  />
                  Minting
                </>
              ) : (
                <>
                  <img
                    src={formSubmitted ? PictureImg : FormPicture}
                    alt="picture-nft"
                    style={{ width: "22px", height: "22px" }}
                  />
                  {formSubmitted ? "Mint" : "Fill in the form"}
                </>
              )}
            </button>
            <button onClick={disconnectWallet}>Disconnect wallet</button>
          </div>
        </>
      )}
      {userAddress && alreadyMinted && (
        <div>
          <p>
            <b>Sorry, you already minted your Taqueria NFT!</b>
          </p>
          <p>
            <b>
              You can find it in your wallet or in the{" "}
              <a
                href="https://better-call.dev/ithacanet/big_map/62449/keys"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                BetterCallDev explorer
              </a>
            </b>
          </p>
          <button onClick={disconnectWallet}>Disconnect wallet</button>
        </div>
      )}
      {!userAddress && (
        <div
          style={{
            marginBottom: stdMarginBottom
          }}
        >
          <button onClick={connectWallet}>Connect your wallet to start</button>
        </div>
      )}
      <h4>About Taqueria</h4>
      <p>
        Taqueria is a Tezos developer tool suite, designed to make working with
        Tezos easier and more secure. Whether you are an aspiring NFT artist or
        a seasoned dapp developer, you can use Taqueria to make your development
        experience better. Try the beta on <a href="/">taqueria.io</a>.
      </p>
      <h4>About Taqueria NFTs</h4>
      <p>
        Taqueria NFTs are a proof that you have been a part of Taqueria from Day
        1. Taqueria will release limited edition NFTs to mark significant events
        in the Taqueria journey. The NFTs will only be available for a limited
        time and will not be reissued once they are closed. Whilst we don't have
        an exact roadmap for these NFTs just yet, holding Taqueria NFTs in
        future may entitle you to receive Taqueria swag or special entrance to
        Taqueria events.
      </p>
    </div>
  );
}
