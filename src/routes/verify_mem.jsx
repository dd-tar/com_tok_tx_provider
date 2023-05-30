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

export default function VerifyMem() {

    const params = useParams();
    const comId = params.com_id;
    const newMemberId = params.user_tg_id;
    let provider = null;

    const [result,  setResult] = useState("");
    const [error,  setError] = useState("");

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
                factoryContract.on("VerificationAccepted", (_comId, _senderTgID, _tgId) => {
                    console.log({
                        comId: _comId,
                        senderId: _senderTgID,
                        memberIgID: _tgId
                    });

                    setResult("Your verification accepted!" +
                        "\nThe bot will send you a notification.");
                });

                var transaction = factoryContract.verifyMember(comId, newMemberId)
                    .catch(async function (_error) {
                        setResult('');
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
                    })
                console.log("tx: ", transaction)
            })
            .catch(function (error) {
                console.error(error)
            })
    }, [comId, newMemberId]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3> You're about to verify community member with {newMemberId} Telegram ID. </h3><br />
                <Text>In order to sign or cancel the transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result} </Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error} </Text>
        </ChakraProvider>
    );
}