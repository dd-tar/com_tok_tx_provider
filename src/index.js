import { render } from "react-dom";
import React from 'react';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";
import App from './App';
import CreateCommunity from "./routes/create_community";
import MintToken from "./routes/mint_token";
import ChangePrice from "./routes/change_price";
import CreateComTok from "./routes/create_com_with_token";
import Reward from "./routes/reward";
import TaskRes from "./routes/task_res";
import VotingRes from "./routes/voting_res";
import Vote from "./routes/Vote";
import StartTaskVoting from "./routes/start_task_voting";
import ProposeSolution from "./routes/propose_solution";
import VerifyMem from "./routes/verify_mem";
import CreateMem from "./routes/create_member";
import CreateTask from "./routes/create_task";
import CreateVoting from "./routes/create_voting";
import {Text} from "@chakra-ui/react";

export const communityFactoryAddress = "0x64fE4979598eA35EB8E725FAfeeA1DFA7c11Bea2"; // Paste ComFactory address here
export const backlogAddress = "0x16bccDedDDb5a2c412Dc5e269B327Ef34EEfEcA0" // Paste Backlog address here
export const votingAddress = "0xe7D5E1eeb5c1D76408978728d0D5bB0F80647Bd6" // Paste Voting address here
export const baseURI = "http://127.0.0.1:5000"

const rootElement = document.getElementById('root');

render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route path="mint_token" element={<MintToken />}>
                    <Route path=":token_address/:amount" element={<MintToken />} />
                </Route>

                <Route path="change_price" element={<ChangePrice />}>
                    <Route path=":token_address/:new_price" element={<ChangePrice />} />
                </Route>

                <Route path="create_com_tok/" element={<CreateComTok />}>
                    <Route path=":name/:symbol/:price/:comWallet/:creator" element={<CreateComTok />} />
                </Route>

                <Route path="create_community/" element={<CreateCommunity />}>
                    <Route path=":com_wallet/:token_addr/:creator" element={<CreateCommunity />} />
                </Route>

                <Route path="create_member/" element={<CreateMem />}>
                    <Route path=":com_id/:user_tg_id" element={<CreateMem />} />
                </Route>

                <Route path="verify_member/" element={<VerifyMem />}>
                    <Route path=":com_id/:user_tg_id" element={<VerifyMem />} />
                </Route>

                <Route path="create_task/" element={<CreateTask />}>
                    <Route path=":com_id/:deadline/:reward" element={<CreateTask />} />
                </Route>

                <Route path="create_voting/" element={<CreateVoting />}>
                    <Route path=":com_id/:n_of_options/:deadline" element={<CreateVoting />} />
                </Route>

                <Route path="propose_solution/" element={<ProposeSolution />}>
                    <Route path=":com_id/:task_id" element={<ProposeSolution />} />
                </Route>

                <Route path="start_task_voting/" element={<StartTaskVoting />}>
                    <Route path=":com_id/:task_id/:voting_deadline" element={<StartTaskVoting />} />
                </Route>

                <Route path="vote/" element={<Vote />}>
                    <Route path=":com_id/:proposal_id/:option" element={<Vote />} />
                </Route>

                <Route path="voting_res/" element={<VotingRes />}>
                    <Route path=":com_id/:proposal_id" element={<VotingRes />} />
                </Route>

                <Route path="task_res/" element={<TaskRes />}>
                    <Route path=":com_id/:task_id" element={<TaskRes />} />
                </Route>

                <Route path="reward/" element={<Reward />}>
                    <Route path=":com_id/:task_id" element={<Reward />} />
                </Route>

                <Route
                    path="*"
                    element={
                        <main style={{ padding: "1rem" }}>
                            <Text fontSize='2xl' align='center' >There's nothing here! </Text>
                        </main>
                    }
                />
            </Route>
        </Routes>
    </BrowserRouter>,
    rootElement
);
//  <React.StrictMode>

reportWebVitals();
