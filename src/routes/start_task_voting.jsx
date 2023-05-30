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
import {backlogAddress} from "../index";
import BacklogABI from "../abi/Backlog.json";

export default function StartTaskVoting() {
    const params = useParams();
    const comId = params.com_id;
    const taskId = params.task_id;
    const votingDeadline = params.voting_deadline;
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
        provider.enable()
            .then(function (accounts) {
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const backlogContract = new ethers.Contract(backlogAddress, BacklogABI, ethersProvider.getSigner());
                console.log(accounts)
                console.log("account: ", accounts[0]);
                backlogContract.on("TaskClosed",(_token, _taskId) => {
                    console.log({
                        cmToken: _token,
                        taskId: _taskId
                    });

                    setResult("The " + _taskId + " Task voting started successfully!" +
                        "\nThe bot will send notification to the group chat.");
                });

                let transaction = backlogContract.startVoting(taskId, comId, votingDeadline)
                    .catch(async function (_error) {
                        const data = _error.data;
                        console.log("Data: ", data)
                        let reason = "";
                        try {
                            reason = Object.values(data)[0];
                        }catch {
                            reason = Object.values(_error)[0];
                            setError("The transaction failed.\n" + _error.toString())
                        }
                        setError("The transaction failed.\nReason: " + reason)
                    });
                console.log(transaction);
            })
            .catch(function (error) {
                console.error(error)
            })
    }, [comId, taskId]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3> You're about to start voting on {taskId} Task solutions. </h3><br />
                <Text>In order to sign or cancel this transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result}</Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error}</Text>
        </ChakraProvider>
    );
}