# Transaction Provider Site for ComTokBot
This repository contains the code of the site for transaction signing for ComTokBot (Telegram). It is a part of final qualifying paper on the topic
"Tools for building tokenized communities".

See also smart contracts of the system:  
https://github.com/dd-tar/com_tok_contracts

ComTokBot:  
https://github.com/dd-tar/com_tok_bot

## Main project files
`src/abi` – directory containing smart contract interfaces. Used when calling smart contract methods.  
`src/routes` - is a directory containing files with the site page code. Each page is responsible for calling and signing a transaction of one of the smart contract methods.  
`src/ìndex.js` - a file that collects all site dependencies, as well as all pages from the routes directory into a single application. Also contains constants with addresses of contracts.


## Application launch

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.  
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

If you have deployed your own [smart contract instances](https://github.com/dd-tar/com_tok_contracts), please remember to change the `communityFactoryAddress`, `backlogAddress`, `votingAddress` values in the `src/index.js` file before running the app.
  