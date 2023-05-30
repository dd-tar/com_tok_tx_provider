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
import { backlogAddress } from "../index";
import BacklogABI from '../abi/Backlog.json';
import {wait} from "@testing-library/user-event/dist/utils";
import {on} from "process";

function CreateTask(effect, deps) {
    const params = useParams();
    // com_id/:deadline/:reward
    const com_id = params.com_id;
    const deadline = params.deadline;
    const reward = params.reward;
    let provider = null;

    const [result,  setResult] = useState("");
    const [error, setError] = useState("");
    const [formValues, setFormValues] = useState({
        task_name: undefined,
        task_description: undefined
    });

    const handleChange = (e) =>{
        setFormValues({
            ...formValues, [e.target.id]: e.target.value
        })
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        console.log(formValues);
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
                backlogContract.on("TaskCreated", (_taskId, _token, _creator_id, _name, _description, _deadline, _reward) => {
                    console.log({
                        task_id: _taskId,
                        com_token: _token,
                        creator_id: _creator_id,
                        name: _name,
                        description: _description,
                        deadline: _deadline,
                        reward: _reward
                    });

                    setResult("Task " + _taskId + " created!" +
                        "\nName: " + _name +
                        "\nDescription: " + _description +
                        "\nDeadline: " + new Date(_deadline * 1000).toLocaleString() +
                        "\nReward: " + _reward +
                        "\n\nThe bot will send you more info.");
                });


                var transaction = backlogContract.createTask(com_id, formValues['task_name'], formValues['task_description'], deadline, reward)
                    /*.catch(async function (_error) {
                        setError("The transaction failed.\n" + _error.toString())
                    })*/
                    .catch(async function (_error) {
                        setResult("");
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
    };

    useEffect(() => {
        setResult('');
        setError('');
    }, [com_id, deadline, reward]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3>You're about to create a Task with the following values:</h3><br />
                <Text as='b' fontSize='3xl' align='center'> Task deadline: in {deadline} hours </Text> <br />
                <Text as='b' fontSize='3xl' align='center'> Reward for the best solution: {reward} ETH </Text> <br />
                <Text>In order to sign or cancel the creation transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />

                <div className="App">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="task_name">Task name</label>
                            <input
                                type="text"
                                id="task_name"
                                value={formValues.task_name || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="task_description">Link to task description</label>
                            <input
                                type="url"
                                id="task_description"
                                value={formValues.task_description || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            Submit
                        </button>
                    </form>
                </div>

            </Box>
            <Text color='green' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {result}</Text>
            <Text color='blue' fontSize='2xl' align='center' whiteSpace = 'pre-line'> {error}</Text>
        </ChakraProvider>

    );
}

export default CreateTask;