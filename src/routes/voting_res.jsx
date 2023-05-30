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
import {votingAddress} from "../index";
import VotingABI from "../abi/Voting.json";

export default function VotingRes() {

    const params = useParams();
    const comId = params.com_id;
    const propId = params.proposal_id;
    let provider = null;

    const [result, setResult] = useState("");
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
        else
            alert("Install MetaMask extension!")
        provider.enable()
            .then(function (accounts) {
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const votingContract = new ethers.Contract(votingAddress, VotingABI, ethersProvider.getSigner());
                console.log(accounts)
                console.log("account: ", accounts[0]);
                votingContract.on("ProposalExecuted", (_comToken, _proposalId, _winningOptions) => {
                    console.log({
                        com_token: _comToken,
                        voting_id: _proposalId,
                        winning_options:  _winningOptions
                    });

                    setResult("Your voting results of " + propId + " voting are counted!\n" +
                        "Winning options: " + _winningOptions +
                        "\nThe bot will send a notification with results to the group.")
                });

                let transaction = votingContract.executeVoting(comId, propId)
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
                    })
                console.log(transaction);
            })
            .catch(function (error) {
                // Handle error. Likely the user rejected the login
                // alert.call(error);
                console.error(error)
            })
    }, [comId, propId]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3> You're about to count voting results <br />of <b>{propId}</b> voting.</h3><br />
                <Text>In order to sign or cancel the mint transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result}</Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error}</Text>
        </ChakraProvider>
    );
}