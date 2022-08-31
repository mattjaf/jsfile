import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/IERC721.json"
import Image from "next/image"
import { Card, useNotification } from "@web3uikit/core"
import { ethers } from "ethers"
import ProfileModal from "./ProfileNftModal"
import axios from "axios"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBoxV2({ nftAddress, tokenId, tokenUri, marketplaceAddress, metadata }) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    async function checkLink(url) {
        return (await fetch(url)).ok
    }
    async function Axios(tokenURI) {
        await axios.get(tokenURI)
    }

    async function updateUI() {
        const tokenURI = tokenUri
        const Metadata = metadata
        console.log(`The TokenURI is ${tokenURI}`)
        console.log(tokenId)
        console.log(nftAddress)

        if (tokenURI != undefined && tokenURI != null && tokenURI != "Invalid uri") {
            checkLink(imageURI).then((value) => {
                if (value == true) {
                    //const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                    const tokenURIResponse = Axios(tokenURI)
                    const imageURI = tokenURIResponse.data.image
                    //const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                    checkLink(imageURI).then((value) => {
                        if (value == false) //yellow=imageURI returned 404 imageURI
                            setImageURI("https://img.freepik.com/free-vector/404-error-with-landscape-concept-illustration_114360-7888.jpg?w=2000")
                        else
                            setImageURI(imageURI)
                    })
                    setTokenName(tokenURIResponse.data.name)
                    setTokenDescription(tokenURIResponse.data.description)
                    console.log(imageURI)
                    console.log(tokenName)
                    console.log(tokenDescription)
                } else {
                    setImageURI("https://www.elegantthemes.com/blog/wp-content/uploads/2020/02/000-404.png")
                    setTokenName("Your NFT's URI is 404")
                    setTokenDescription("Your NFT's URI 404ed")
                }
            })
        }
        if (tokenURI === "Invalid uri") {
            const MetaData = JSON.parse(Metadata)
            console.log(`you metadata is ${MetaData}`)
            setTokenName(MetaData.name)
            setTokenDescription("MetaData.description")
            checkLink(MetaData.image).then((value) => {
                if (value == false) //green=DataUrlImageURI returned 404 imageURI
                    setImageURI("https://img.freepik.com/free-vector/404-error-with-landscape-concept-illustration_114360-7898.jpg?w=2000")
                else
                    setImageURI(MetaData.image)
            })
        }
        if (tokenURI === null) {
            setImageURI("null")
            setTokenName("null")
            setTokenDescription("null")
        }
        if (tokenURI === undefined) {
            setImageURI("undefined")
            setTokenName("undefined")
            setTokenDescription("undefined")
        }

        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }
    async function handleOnError() {
        console.log("error")
    }

    const handleCardClick = () => {
        setShowModal(true)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            //console.log(imageURI)
        }
    }, [isWeb3Enabled, account])

    const formattedDescription = truncateStr(tokenDescription || "", 15)
    const formattedTokenName = truncateStr(tokenName || "", 15)
    const formattedTokenId = truncateStr(tokenId || "", 15)


    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <ProfileModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            tokenDescription={tokenDescription}
                            imageURI={imageURI}
                            tokenName={tokenName}
                            nftAddress={nftAddress}
                            onClose={hideModal}

                        />
                        <Card
                            title={tokenName}
                            description={formattedDescription}
                            onClick={handleCardClick}

                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{formattedTokenId}</div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                        onError={handleOnError}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
