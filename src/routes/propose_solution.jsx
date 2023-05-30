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

function ProposeSolution(effect, deps) {
    const params = useParams();
    // com_id/:deadline/:reward
    const comId = params.com_id;
    const taskId = params.task_id;
    let provider = null;

    const [result,  setResult] = useState("");
    const [error, setError] = useState("");
    const [formValues, setFormValues] = useState({
        solution: undefined
    });

    const handleChange = (e) =>{
        setFormValues({
            ...formValues, [e.target.id]: e.target.value
        })
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        setResult('');
        setError('');
        console.log(formValues);
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
                backlogContract.on("SolutionProposed",(_com_token, _taskId, _solId, _member_id, _solution)=> {
                    console.log({
                        token: _com_token,
                        task_id: _taskId,
                        sol_id: _solId,
                        creator_id: _member_id,
                        sol_description: _solution
                    });

                    setResult("Your solution for Task with ID = " + _taskId + " submitted!" +
                        "\nSolution ID: " + _solId +
                        "\nLink to solution: " + _solution +
                        "\n\nThe bot will send you notification.");
                });

                var transaction = backlogContract.proposeSolution(comId, taskId, formValues['solution'])
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
                    })
                console.log("tx: ", transaction)
            })
            .catch(function (error) {
                console.error("ERROR: ", error)
            })
    };

    useEffect(() => {
        setResult('');
        setError('');
    }, [comId, taskId, formValues]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3>You're about to propose a solution for the Task </h3><br />
                <Text as='b' fontSize='3xl' align='center'> Task ID: {taskId} </Text> <br />
                <Text>Please, input a link to your solution into the text field below.</Text>
                <Text>In order to sign or cancel the creation transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
                <div className="App">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="Link to solution:"> Link to solution: </label>
                            <input
                                type="url"
                                id="solution"
                                value={formValues.solution || ""}
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

export default ProposeSolution;