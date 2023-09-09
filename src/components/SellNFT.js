import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import {motion} from 'framer-motion'
import Lottie from 'lottie-react'

import { useLocation } from "react-router";
import floatingNFT from "../Lottie/floatingNFT.json"

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();

    async function disableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = true
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = false
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        //check for file extension
        try {
            //upload the file to IPFS
            disableButton();
            updateMessage("Uploading image.. please dont click anything!")
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                enableButton();
                updateMessage("")
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
            }
        }
        catch(e) {
            console.log("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL)
        {
            updateMessage("Please fill all the fields!")
            return -1;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1)
                return;
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    console.log("Working", process.env);
    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-row justify-around place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
                <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <motion.div initial={{opacity:0,translateX:100}} animate={{opacity:1,translateX:0}} transition={{duration:1,delay:0.5}}>
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    </motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2,delay:1.2}}>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                    </motion.div>
                </div>
                <div className="mb-6">
                    <motion.div initial={{opacity:0,translateX:100}} animate={{opacity:1,translateX:0}} transition={{duration:1,delay:0.5}}><label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label></motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2,delay:1.2}}>
                        <textarea className="shadow appearance-none border rounded w-full px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y min-h-25 max-h-40" cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                    </motion.div>
                </div>
                <div className="mb-6">
                    <motion.div initial={{opacity:0,translateX:100}} animate={{opacity:1,translateX:0}} transition={{duration:1,delay:0.5}}><label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label></motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2,delay:1.2}}>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                    </motion.div>
                </div>
                <motion.div >
                    <motion.div initial={{opacity:0,translateX:100}} animate={{opacity:1,translateX:0}} transition={{duration:1,delay:0.5}}><label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label></motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2,delay:1.2}}><input type={"file"} onChange={OnChangeFile}></input></motion.div>
                </motion.div>
                <br></br>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="text-red-500 text-center">{message}</motion.div>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2,delay:1.2}}>
                <motion.button whileHover={{scale:1.2}} whileTap={{scale:0.8}} onClick={listNFT} className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500 hover:bg-gradient-to-r 
                                                    hover:from-blue-500 hover:via-blue-600 hover:to-purple-500 transition-all duration-1200 text-white py-2 px-4 rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-purple-400">
                    List NFT
                </motion.button>
                </motion.div>
            </form>
            <div style={{height:"60vh",width:"60vh"}}>
                <Lottie animationData={floatingNFT} />
            </div>
        </div>
        </div>
    )
}