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
import {backlogAddress, votingAddress} from "../index";
import BacklogABI from "../abi/Backlog.json";
import VotingABI from "../abi/Voting.json";
import {wait} from "@testing-library/user-event/dist/utils";

export default function Reward() {

    const params = useParams();
    const comId = params.com_id;
    const taskId = params.task_id;
    let provider = null;
    let reward = 0;
    let nOfWinners = 0;
    let sum = 0;
    let votingID = 0;

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
                const votingContract = new ethers.Contract(votingAddress, VotingABI, ethersProvider.getSigner());
                const getReward = async() =>{
                    const rew = await backlogContract.getTaskReward(comId, taskId)
                        .catch(async function (_error) {
                            setError("The transaction failed.\nReason: can't get task reward")
                        })
                    console.log("Reward = ", parseInt(rew))
                    reward = rew;
                    console.log("account: ", accounts[0]);
                    return rew;
                };
                getReward()
                    .then(function(){
                        const votingId = async () =>{
                            votingID = await backlogContract.getVotingByTaskId(comId, taskId)
                                .catch(async function (_error) {
                                    setError("The transaction failed.\nReason: can't get tasks' voting ID")
                                })
                            console.log("Voting ID = ", votingID)
                            console.log("account1: ", accounts[0]);
                            //reward = rew;
                            return votingID;
                        };
                        votingId()
                            .then(function (){
                            const nOfW = async() =>{
                                console.log("Voting ID2 = ", parseInt(votingID))
                                let winners = await votingContract.getVotingWinningOptions(comId, parseInt(votingID))
                                .catch(async function (_error) {
                                    setError("The transaction failed.\nReason: can't get tasks' winners")
                                })
                                nOfWinners = Object.values(winners)['length']
                                console.log("Winners = ", winners)
                                console.log("nOfWinners = ", parseInt(nOfWinners))
                                console.log("account2: ", accounts[0]);
                                return nOfWinners;
                            };
                            nOfW()
                                .then(function () {
                                    //console.log(accounts)
                                    sum = parseInt(nOfWinners) * reward * 1e18;
                                    console.log("account3: ", accounts[0]);
                                    console.log("sum: ", sum);
                                    backlogContract.on("TaskClosed",(_token, _taskId) => {
                                        console.log({
                                            cmToken: _token,
                                            taskId: _taskId
                                        });
                                        setResult("Rewards for " + _taskId + " Task sent successfully!" +
                                            "\nThe bot will send notification to the group.");
                                    });
                                    const intAmount = parseInt(reward);
                                    const weiAmount = (reward * 1e18).toString();
                                    const options = {value: ethers.utils.parseUnits(sum.toString(), "wei")} // ETH to wei
                                    // console.log("parseUnits: ", options.value.toString())

                                    let transaction = backlogContract.rewardSolversAndClose(comId, taskId, options)
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
                            })
                    })
            }) // provider enable
        .catch(function (error) {
            console.error(error)
        })
    }, [comId, taskId]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3> You're about to reward solvers of {taskId} Task. </h3><br />
                <Text>In order to sign or cancel this transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result}</Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error}</Text>
        </ChakraProvider>
    );
}