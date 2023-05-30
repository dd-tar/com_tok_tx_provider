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
import { ethers} from "ethers";
import Web3 from 'web3';
import { communityFactoryAddress } from "../index";
import FactoryABI from '../abi/CommunityFactory.json';
import {wait} from "@testing-library/user-event/dist/utils";

export default function CreateCommunity() {
    const params = useParams();
    const comToken = params.token_addr
    const comWallet = params.com_wallet;
    const creator = params.creator;
    let provider = null;

    const [result,  setResult] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setResult('');
        setError('');
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8080");
        const accounts =  async() => {await web3.eth.getAccounts()};
        console.log("use effect started")
        if(typeof window.ethereum !== 'undefined') {
            // Ethereum user detected. You can now use the provider.
            provider = window['ethereum']
            console.log('metamask found');
        }
        provider.enable()
            .then(function (accounts) {
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const factoryContract = new ethers.Contract(communityFactoryAddress, FactoryABI, ethersProvider.getSigner());
                console.log(accounts)
                console.log("account: ", accounts[0]);
                factoryContract.on("CommunityCreated", (ctr_com_id, _wallet, _mainToken, creatorTgID, sender) => {
                    console.log({
                        ctr_com_id: ctr_com_id,
                        wallet: _wallet,
                        mainToken: _mainToken,
                        creatorTgID: creatorTgID,
                        sender: sender
                    });

                    setResult("Community and token created!" +
                        "\nToken address: " +
                        (_mainToken).toString() +
                        "\nCommunity wallet: " + _wallet +
                        "\n\nThe bot will send you more info.");
                });

                var transaction = factoryContract.createCommunity(comWallet, comToken, creator)
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
                console.log("tx: ", transaction)
            })
            .catch(function (error) {
                console.error("ERROR: ", error)
            })
    }, [comToken, comWallet, creator]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3> You're about to create a community with custom token. </h3><br />
                <Text as='b' fontSize='3xl' align='center'> Token address: <br />{comToken} </Text> <br />
                <Text as='b' fontSize='3xl' align='center'> Community wallet: <br />{comWallet} </Text> <br /><br />
                <Text>Please note that some features may work differently with custom token implementations.</Text>
                <Text>In order to sign or cancel the creation transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result} </Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error} </Text>
        </ChakraProvider>
    );
}