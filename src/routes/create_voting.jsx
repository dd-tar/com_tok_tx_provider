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
import { votingAddress } from "../index";
import VotingABI from '../abi/Voting.json';
import {wait} from "@testing-library/user-event/dist/utils";
import {on} from "process";
import {Nav} from "react-bootstrap";

function CreateVoting(effect, deps) {
    const params = useParams();
    // :com_id/:n_of_options/:deadline
    const comId = params.com_id;
    const optionsNumber = params.n_of_options;
    const deadline = parseInt(params.deadline);
    let provider = null;

    const [result,  setResult] = useState("");
    const [error, setError] = useState("");
    const [formValues, setFormValues] = useState({
        description: undefined
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
                const votingContract = new ethers.Contract(votingAddress, VotingABI, ethersProvider.getSigner());
                console.log(accounts)
                console.log("account: ", accounts[0]);
                votingContract.on("ProposalCreated",(_comToken, _propId, _memberId, _proposal,
                                                      _numberOfOptions, _deadline)=> {
                    console.log({
                        token: _comToken,
                        voting_id: _propId,
                        creator_id: _memberId,
                        sol_description: _proposal,
                        n_of_options: _numberOfOptions,
                        deadline_ts: _deadline
                    });

                    var dateTimeDeadline = new Date(_deadline * 1000)
                    var dtDeadline = dateTimeDeadline.toLocaleString()

                    setResult("Voting on your proposal started successfully!\n" +
                        "\nVoting ID: " + _propId +
                        "\nNumber of options: " + _numberOfOptions +
                        "\nLink to description: " + _proposal +
                        "\nDeadline: " + dtDeadline +
                        "\n\nThe bot will send notification to the group.");
                });

                var transaction = votingContract.createProposal(comId, formValues['description'], optionsNumber, deadline, accounts[0])
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
                console.log("tx: ", transaction)
            })
            .catch(function (error) {
                console.error("ERROR: ", error)
            })
    };

    useEffect(() => {
        setResult('');
        setError('');
        if (isNaN(deadline))
            setError('Wrong deadline value. It should be an integer number of hours.')
        if (isNaN(parseInt(optionsNumber)))
            setError('Wrong number of voting options value. It should be an integer number.')
    }, [comId, optionsNumber, deadline, formValues]);

    return (
        <ChakraProvider>
            <Box minW='max-content' borderWidth='2px' borderRadius='lg' overflow='hidden' fontSize='2xl' alignItems='center' align='center' gap='2'>
                <br /><h3> You're about to create a voting. </h3><br />
                <Text as='b' fontSize='3xl' align='center'> The voting deadline: in {deadline} hour(s) </Text> <br />
                <Text as='b' fontSize='3xl' align='center'> Number of voting options: {optionsNumber} </Text> <br />
                <Text>Please, input a link to the description of your voting proposal into the text field below.<br />Don't forget to describe voting options and acceptance criteria.</Text>
                <Text>In order to sign or cancel the creation transaction, please use MetaMask.</Text>
                <Text>In the mobile version, it will open in a new browser tab.</Text> <br />
                <div className="App">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="Link to solution:"> Link to voting proposal description: </label>
                            <input
                                type="url"
                                id="description"
                                value={formValues.description || ""}
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

export default CreateVoting;