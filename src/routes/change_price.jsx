import {
    Box,
    ChakraProvider,
    Text
} from "@chakra-ui/react";
import React, {
    useEffect,
    useState
} from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import Web3 from 'web3';
import TokenABI from '../abi/CommunityToken.json';

/* global BigInt */

export default function ChangePrice() {

    const params = useParams();
    const token_address = params.token_address;
    const new_price = params.new_price;
    let old_price = 0;
    let provider = null;

    const [result, setResult] = useState("");
    const [oPrice, setOPrice] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setResult('');
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8080");
        const accounts =  async() => {await web3.eth.getAccounts()};

        console.log("use effect started")
        console.log("new_price = ", new_price)
        console.log("token = ", token_address)
        if(typeof window.ethereum !== 'undefined') {
            // Ethereum user detected. You can now use the provider.
            provider = window['ethereum']
            console.log('metamask found');
        }
        else
            alert("Install MetaMask extension!")
        provider.enable()
            .then(function (accounts) {
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const tokenContract = new ethers.Contract(token_address, TokenABI, ethersProvider.getSigner());
                // получить price
                const getOldPrice = async() => {
                    const pr = await tokenContract.getPrice();
                    console.log("old pr await = ", parseInt(pr));
                    old_price = ethers.utils.formatEther(pr.toString());
                    console.log("old price getPrice to ETH = ", old_price)
                    return pr;
                };
                getOldPrice()
                    .then( function () {
                    console.log(accounts);
                    console.log("account: ", accounts[0]);
                    console.log("New price: ", new_price);

                    setOPrice(old_price);

                    tokenContract.on("PriceChanged", (_tokenAddress, _newPrice) => {
                        console.log({
                            tokenAddress: _tokenAddress,
                            newPrice: _newPrice
                        });

                        setResult("Price changed successfully!" +
                            "\nToken address: " + token_address +
                            "\nNew token price: " + new_price + " ETH"
                        );
                    });

                    const weiNewPrice = BigInt(new_price * 1e18);
                        console.log("wei new price: ", weiNewPrice);
                    /*const BNNewPrice = web3.utils.toBN(intNewPrice);
                        console.log("BN new price: ", intNewPrice);*/
                    let transaction = tokenContract.setPrice(weiNewPrice)
                        .catch(async function (_error) {
                            const data = _error.data;
                            console.log("Data: ", data)
                            let reason = "";
                            try {
                                reason = Object.values(data)[0];
                            }catch {
                                reason = Object.values(_error)[0];
                                setError("The transaction failed.\n" + _error.toString()) //_error.toString()
                            }
                            setError("The transaction failed.\nReason: " + reason)
                        });
                        console.log(transaction);

                }) // then - price
            }) // then - metamask provider
            .catch(function (error) {
                // Handle error. Likely the user rejected the login
                console.error(error)
            })
    }, [token_address, new_price]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3>You're about to change price of token <br/> of <b>{token_address}</b> contract.</h3><br />
                <Text>From <b>{oPrice.toString()}</b></Text>
                <Text>To <b>{new_price}</b></Text><br />
                <Text>In order to sign or cancel this transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result}</Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error}</Text>
        </ChakraProvider>
    );
}