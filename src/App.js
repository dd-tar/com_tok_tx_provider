import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Outlet } from "react-router-dom";
import './App.css';
import {
    ChakraProvider,
    Text
} from "@chakra-ui/react";

export default function App() {
    /*const [data, setdata] = useState({
        address: '',    // Stores address
        Balance: null  // Stores balance
    })

    const connectHandler = () => {
        // Asking if metamask is already present or not
        if (window.ethereum) {
            // res[0] for fetching a first wallet
            window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((res) => accountChangeHandler(res[0]));
        } else {
            alert("You have to install MetaMask extension!");
        }
    };
    между Text(ComTokBot Approver) и Outlet:
    <nav
            style={{
              borderBottom: "solid 1px",
              paddingBottom: "1rem",
            }}
          >
            <Link to="/create_token">Create Token</Link> |{" "}
            <Link to="/mint_token">Mint Token</Link> |{" "}
            <Link to="/change_price">Change Price</Link> |{" "}
            <Link to="/verify_address">Verify Address</Link>
          </nav>
    <Card className="text-center">
              <Card.Header>
                  <strong>Address: </strong>
                  {data.address}
              </Card.Header>
              <Card.Body>
                  <Card.Text>
                      <strong>Balance: </strong>
                      {data.Balance}
                  </Card.Text>
                  <Button onClick={connectHandler} variant="primary">
                      Connect to wallet
                  </Button>
              </Card.Body>
          </Card>

    // Function for getting handling all events
    const accountChangeHandler = (account) => {
        console.log("Entered account change handler")

        window.ethereum
            .request({
                method: "eth_getBalance",
                params: [account, "latest"]
            })
            .then((balance) => {
                setTimeout(() => {
                    setdata({
                        address: account,
                        Balance: ethers.utils.formatEther(balance),
                    });
                }, 1000);
            });

    };*/

  return (
      <ChakraProvider>
          {/* Calling all values which we have stored in usestate */}
          <Text fontSize='3xl' align='center'><b>ComTokBot Provider</b></Text>

          <Outlet />
      </ChakraProvider>
  );
}
