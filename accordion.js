import { Modal, Input, Button, useNotification, Accordion, Tag, Badge, Row, Card } from "@web3uikit/core"
import React, { useState, useEffect } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
import Image from "next/image"
import styled from "styled-components";
import nftAbi from "../constants/BasicNft.json"
import Link from "next/link"
import styles from "../styles/Home.module.css"


const StyledModal = styled(Modal)`
        div {

        }
    `;
const StyledBadge = styled(Badge)`
        div {
        }
    `;
const StyledCard = styled(Card)`
        div {
            
        }
    `;

export default function ProfileNftModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    tokenDescription,
    tokenName,
    imageURI,
    name,
    symbol,
    attributes,
    onClose,
    isListed,
    setIsListed
}) {
    const dispatch = useNotification()
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0)
    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Approving...")
        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId),
            onError: (error) => {
                console.log(error)
            },
        })

    }

    async function handleApproveSuccess(nftAddress, tokenId) {
        console.log("Ok! Now time to list")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListingSuccess,
            onError: (error) => console.log(error),
        })
    }

    async function handleListingSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
        setIsListed(false)
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    const handleCancelListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Listing canceled successfully",
            title: "Listing Canceled",
            position: "topR",
        })
        setIsListed(true)
        onClose && onClose()
    }

    const { runContractFunction: cancelListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "cancelListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    const { runContractFunction: getListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function approveAndListButton() {
        if (priceToUpdateListingWith !== 0) {
            approveAndList({
                onError: (error) => {
                    console.log(error)
                }
            })
        }
        else {
            onClose()
        }
    }

    return (

        <StyledModal
            width="600px"
            //height="350px"
            //hasFooter={false}
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={isListed ? () => {
                approveAndListButton()
            } : onClose}
        >
            <div /*\
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}*/>
                <div>
                    <Link href={`https://testnets.opensea.io/assets/rinkeby/${nftAddress}/${tokenId}`}>
                        <a className="mr-4 hover:text-sky-700" target="_blank" rel="noreferrer">
                            <Image
                                src={"/openSealogo.svg"}
                                alt="failed"
                                height="25"
                                width="25"
                            />
                            {name} ({symbol}) # {tokenId}
                        </a>
                    </Link>
                </div>
                <Link href={`https://rinkeby.etherscan.io/address/${nftAddress}`} >
                    <a className="mr-4 hover:text-sky-700" target="_blank" rel="noreferrer" >
                        <Image
                            src={"/logos/etherscan-logo-circle.svg"}
                            alt="failed"
                            height="17"
                            width="17"
                        /> Contract: {nftAddress}</a>
                </Link>
                <div>
                    name: {tokenName}
                </div>
                {/*Image with forsale sign*/}
                <div className={styles.overlapGrid}>
                    <Image
                        className="cursor-pointer"
                        loader={() => imageURI}
                        src={imageURI}
                        height="200"
                        width="200"
                        onClick={() => {
                            onclick = window.open(
                                `${imageURI}}`,
                                'popUpWindow',
                                'height=400,width=600,left=10,top=10')
                        }}
                    />
                    {!isListed ? <Image
                        className="opacity-50 cursor-pointer"
                        src={"/for-sale.png"}
                        alt="failed"
                        height="200"
                        width="200"
                        onClick={() => {
                            onclick = window.open(
                                `${imageURI}}`,
                                'popUpWindow',
                                'height=400,width=600,left=10,top=10')
                        }}
                    /> :
                        <div />}

                </div>
                <div>
                    description: {tokenDescription}
                </div>


                {/*Attributes accordion*/}
                <div className="flex flex-wrap">
                    <Accordion
                        id="accordion"
                        //tagText="Tag!"
                        isExpanded
                        title="Atrributes"
                    >
                        {attributes ? (Object.keys(attributes).map((key) =>
                            <div style={{
                                float: "right",
                                margin: "2px"

                            }}>
                                <StyledCard

                                    style={{
                                        backgroundColor: 'rgb(225,246,255)',
                                        outlineColor: 'rgb(0,171,240)',
                                        height: "75px",
                                        width: '100px',
                                        fontSize: "13px",
                                        color: 'rgb(0,171,240)',
                                        margin: "2px",
                                        alignItems: 'center',
                                        justifyContent: 'center',


                                    }}
                                    title={`${attributes[key]}`}
                                >
                                    <div
                                        style={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >

                                        {`${key}:`}

                                    </div>
                                </StyledCard>
                                <br />
                            </div>

                        )) : (
                            <div />
                        )}
                    </Accordion>
                </div>

                {/*List and Cancel Buttons*/}
                <div>
                    {isListed ? (
                        <div className="font-bold">
                            Sell You NFT!
                            <Input
                                label="Sale Price (ETH)"
                                name="New listing price"
                                type="number"
                                onChange={(event) => {
                                    setPriceToUpdateListingWith(event.target.value)
                                }}
                            />
                        </div>
                    ) : (
                        <Button
                            id="Sell NFT"
                            onClick={() =>
                                cancelListing({
                                    onSuccess: handleCancelListingSuccess,
                                })
                            }
                            text="Cancel Listing"
                            theme="colored"
                            color="red"
                            type="button"
                        />
                    )
                    }
                    < br />

                </div>
            </div>

        </StyledModal >

    )
}


