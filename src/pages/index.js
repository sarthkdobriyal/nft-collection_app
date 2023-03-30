import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { ethers, utils } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState("");

  const web3modalRef = useRef();


  const getNumMintedTokens = async () => {

    try{
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );


      const numTokenIds = await nftContract.tokenIds();

        setNumTokensMinted(numTokenIds.toString());


    }catch(err){
      console.log(err);
    }
  }


  const getOwner = async () => {
    try{
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      
      const owner = await nftContract.owner();

      const userAddress = await signer.getAddress();
      if(owner.toLowerCase() === userAddress.toLowerCase()){
        setIsOwner(true);
      }  


    }catch(err){
      console.log(err)
    }
  }



  const startPresale = async () => {
    setLoading(true)
    try{
      const signer = await getProviderOrSigner(true);

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true)



    }catch(err){
      console.log(err)
    }
    setLoading(false)

  }



  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
      return isPresaleStarted;
    } catch (e) {
      console.log(e);
    }
  };

  
  const endPresale = async () => {
    try{
      const signer = await getProviderOrSigner(true);

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )



      const presaleEndedTime = await nftContract.presaleEnded();

      const  currentTimeInSeconds = Date.now() * 1000;

      const hasPresaleEnded = presaleEndedTime.lt(Math.floor(currentTimeInSeconds))

      setPresaleEnded(hasPresaleEnded);



    }catch(err){
      console.log(err)
    }
  }



  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
    } catch (e) {
      console.log(e);
    }
  };




  const connectWallet = async () => {
    console.log("connecting wallet");
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      window.alert("Wallet connected");
    } catch (err) {
      console.log(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3modalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    // console.log(web3Provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId != 5) {
      window.alert("Please switch to goerli network");
      throw new Error("Wrong network ");
    }

    if (needSigner) {
      const signer = await web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
      const preSaleStarted = await checkIfPresaleStarted();
      if(preSaleStarted) {
        await checkIfPresaleEnded();
      }
      await getNumMintedTokens();

      //Track in real time the number of minted NFTS
      setInterval(async () => { 
        await getNumMintedTokens()
      }, 5 * 1000 )

      //Tract in real time the status of presale 
      setInterval(async () =>{
        
       const presaleStarted =  await checkIfPresaleStarted()
       if(presaleStarted){
        await checkIfPresaleEnded();
       }
      
      }  , 5*1000)

  }
  
  useEffect(() => {
    if (!walletConnected) {
      web3modalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad();
    }
  }, []);



  const presaleMint = async () => {
    setLoading(true)
    try {
      const signer = await getSignerOrProvider(true);
  
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )
      
      const txn = await nftContract.presaleMint({
        value:  utils.parseEther("0.01")
      })
      await txn.wait();
      window.alert("Successfully Minted a srtk")
    } catch (err) {
      console.log(err);
    }
    setLoading(false)

  }

  const publicMint = async() => {
    setLoading(true)
    try {
      const signer = await getSignerOrProvider(true);
  
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )
      
      const txn = await nftContract.mint({
        value:  utils.parseEther("0.01")
      })
      await txn.wait();
      window.alert("Successfully Minted a srtk")
    } catch (err) {
      console.log(err);
    }
    setLoading(false);

  }

  const renderBody = () => {

    if(!walletConnected){
      return (
        <button
        onClick={connectWallet}
        className={
          styles.button
        }
        
      >
        Connect Wallet
      </button>
      )
    }


    if(loading){
      return (
        <div class="lds-facebook"><div></div><div></div><div></div></div>
      )
    }

    if(isOwner && !presaleStarted){
      //render button to start the presale
      return (
        <button
          onClick={startPresale}
          className={styles.button}
        >
          Start the presale
        </button>
      )
    }

    if(!presaleStarted){
      //presale hasn't started yet
      return (
        <h2 className={styles.description} >Presale hasn&apos;t started yet! Come back later</h2>
      )
    }

    if(presaleStarted && !presaleEnded){
      //allow users to mint in presale if whitelist
      return (
        <div>
          <span className={styles.description}>Presale! If you&apos;re whitelisted you can mint a <span className={styles.logo}> srtk </span> noww. </span>
        <button className={styles.button} onClick={presaleMint}> 
          Presale Mint ⚡
        </button>
        </div>
      )
    }

    if(presaleEnded){
      return (
        <div>
        <span className={styles.description}>Mint a <span className={styles.logo}> srtk </span> noww. </span>
        <button className={styles.button} onClick={publicMint}> 
         Mint ⚡
      </button>
      </div>
      )
    }

  }





  return (
    <>
      <div>
        <Head>
          <title>SrTK NFT</title>
        </Head>

        <div className={styles.main}>
          <h1 className={styles.title}>Welcome! to SrtK NFTs</h1>
          <span className={styles.description}>{numTokensMinted}/20 have already been minted</span>
          {
            renderBody()
          }
          
        </div>
      </div>
    </>
  );
}
