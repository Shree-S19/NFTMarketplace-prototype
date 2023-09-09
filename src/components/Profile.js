import Navbar from "./Navbar";
// import "./styles.css"
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";

import {motion} from 'framer-motion'
import Lottie from 'lottie-react'

import hologram from "../Lottie/hologram.json"

import { useState } from "react";
import NFTTile from "./NFTTile";

export default function Profile () {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        let sumPrice = 0;
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        //create an NFT Token
        let transaction = await contract.getMyNFTs()

        /*
        * Below function takes the metadata from tokenURI and the data returned by getMyNFTs() contract function
        * and creates an object of information that is to be displayed
        */
        
        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            sumPrice += Number(price);
            return item;
        }))

        updateData(items);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="profileClass" style={{marginTop:"10vh"}}>
                <div className="flex flex-row justify-around">
                        <div>
                            <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                                <motion.div className="mb-5 " initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2,delay:0.3}}>
                                    <motion.h2 className="font-bold text-red-200" >Wallet Address</motion.h2>  
                                    {address}
                                </motion.div>
                            </div>
                            <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2,delay:0.8}}>
                                        <h2 className="font-bold">No. of NFTs</h2>
                                        {data.length}
                                    </motion.div>
                                    <motion.div className="ml-20" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2,delay:0.8}}>
                                        <h2 className="font-bold">Total Value</h2>
                                        {totalPrice} ETH
                                    </motion.div>
                            </div>
                            <div className="flex flex-col text-center items-center mt-11 text-white">
                                <motion.h2 className="font-bold" initial={{translateX:250,opacity:0}} animate={{translateX:0,opacity:1}} transition={{duration:0.6,delay:1}}>Your NFTs</motion.h2>
                                <div className="flex justify-center flex-wrap max-w-screen-xl">
                                    {data.map((value, index) => {
                                    return <NFTTile data={value} key={index} ></NFTTile>;
                                    })}
                                </div>
                                <motion.div className="mt-10 text-xl text-red-500" initial={{opacity:0.3}} animate={{opacity:1}} transition={{delay:0.5,duration:0.8,repeat:Infinity}}>
                                    {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                                </motion.div>
                            </div>
                        </div>
                            <p></p>
                        <motion.div className="locker-animation" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2}} style={{height:"76vh",width:"76vh"}}>
                            <Lottie animationData={hologram} loop={true} />
                        </motion.div>
                        
                        <div>
                                    
                        </div>
                </div>
            </div>
        </div>
    )
};