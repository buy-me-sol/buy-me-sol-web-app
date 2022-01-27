import React, { useState, useEffect } from 'react';
import userLogo from './assets/user.svg';
import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import kp from './keypair.json'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [exploring, setExploring] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [nameInputValue, setNameInputValue] = useState('');
  const [usernameInputValue, setUsernameInputValue] = useState('');
  const [creatingCreator, setCreatingCreator] = useState(false);
  const [creatingSupporter, setCreatingSupporter] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [creatorIndex, setCreatorIndex] = useState(0);
  const [msgInputValue, setMsgInputValue] = useState('');
  const [amountInputValue, setAmountInputValue] = useState(0);

  // States retrieved from solana program
  const [creatorList, setCreatorList] = useState([]);
  const [messages, setMessages] = useState([]);

  // Check if Phantom wallet is connected or not
  const checkIfWalletIsConnected = async () => {
    try {
      // First make sure we have access to window.solana
      // MetaMask automatically injects an special object named solana
      const { solana } = window;

      if (solana.isPhantom) {
        console.log('Phantom wallet found!');

        // Connect the users wallet if we're authorized to acess user's wallet
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with Public Key:',
          response.publicKey.toString()
        );
        setWalletAddress(response.publicKey.toString());
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Connect to wallet
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  // Initialize solana program
  const createBaseAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("🚀 Starting....")
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getCreatorList();
      await getMessages();
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const getCreatorList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setCreatorList(account.creatorList)
    } catch (error) {
      console.log("Error in getCreatorList : ", error)
      setCreatorList(null)
    }
  }

  // Get messages from the solana program
  const getMessages = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      setMessages(account.messages)
    } catch (error) {
      console.log("Error in getting messages : ", error)
    }
  }

  // Send message and solana to creator
  const sendMessage = async () => {
    if (amountInputValue.toString() === '0') return
    console.log(msgInputValue)
    console.log(amountInputValue)

    console.log(creatorList[creatorIndex].userAddress)

    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      console.log(provider.wallet.publicKey)

      await program.rpc.addMessage(creatorList[creatorIndex].userAddress, msgInputValue, amountInputValue.toString(),{
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        }
      });

      setMsgInputValue('')
      setAmountInputValue('')

      console.log("🥳 Successfully send message to  ", creatorList[creatorIndex].userAddress)

       await getMessages()
    } catch (error) {
      console.log("Error sending message: ",error)
    }
  }

  // Call create creator account
  const sendCreator = async () => {
    if (usernameInputValue.length === 0) {
      console.log("No username given!")
      return
    }
    if (nameInputValue.length === 0) {
      console.log("No name given!")
      return
    }
    const usernameFromList = creatorList.map((item) => {
      if (usernameInputValue === item.username.toString()) {
        return item.username.toString()
      }
      return item.username.toString()
    })
    if (usernameInputValue.toString() === usernameFromList.toString()) {
      alert("Username already taken 🤕")
      return
    }

    console.log('Name: ', nameInputValue, ' Username: ', usernameInputValue)
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.createCreator(usernameInputValue, nameInputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      setUsernameInputValue('')
      setNameInputValue('')

      console.log("Successfully created creator account 🥳 ", nameInputValue, " ", usernameInputValue)

      await getCreatorList()
    } catch (error) {
      console.log("Error creating creator account: ",error)
    }
  }

  // Search creator using search bar
  const searchCreator = () => {
    if (!walletAddress) {
      connectWallet()
      return
    }
    if (!creatorList) return

    setInputValue('')

    const stringifiedCreatorList = JSON.stringify(creatorList)

    if(!stringifiedCreatorList.includes(inputValue)) {
      alert("Username not found ☹️")
      return
    }

    creatorList.forEach((item, index) => {
      if (inputValue === item.username.toString()) {
        setViewing(true)
        setCreatorIndex(index)
      }
    });
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching creator list...');
      getCreatorList()
      console.log('Fetching messages...');
      getMessages()
    }
  }, [walletAddress]);

  // Fires of as user type in message field
  const onMessageChange = (event) => {
    const { value } = event.target;
    setMsgInputValue(value);
  }; 
  
  // Fires of as user type in amount field
  const onAmountChange = (event) => {
    const { value } = event.target;
    setAmountInputValue(value);
  }; 

  // Fires off as user type in input box
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  // Fires off as user type in name box
  const onNameChange = (event) => {
    const { value } = event.target;
    setNameInputValue(value);
  }

  // Fires off as user type in username box
  const onUsernameChange = (event) => {
    const { value } = event.target;
    setUsernameInputValue(value);
  }

  // Render Connect Wallet Button
  const renderConnectWalletButton = () => (
    <button className="button gradient-button" onClick={connectWallet}>
      Connect Wallet
    </button>
  );

  // If wallet is connect, render explore creator button
  const renderExploreButton = () => (
    <button className="button gradient-button" onClick={() => {
        setExploring(true)
        setViewing(false)
      }}>
      Explore Creators
    </button>
  );

  // Let user choose who he/she is, creator or supporter
  const renderAuthContainer = () => {
    if (creatorList === null) {
      return (
        <button className="button auth-button" onClick={() => {
          createBaseAccount()
        }}>
          Do One-Time Initialization
        </button>
      )
    } else {
      return(
        <div className="auth-container">
          <h1 className="main-text">
            Who are you?
          </h1>
          <div className="button-container">
            <button className="button auth-button" onClick={
              () => {
                if (!walletAddress) connectWallet()
                setCreatingCreator(true)
              }
            }>
              Creator
            </button>
            <button className="button auth-button" onClick={
              () => {
                if (!walletAddress) connectWallet()
                setCreatingSupporter(true)
              }
            }>
              Supporter
            </button>
          </div>
        </div>
      )
    }
  }

  // If wallet not connect, display text
  const renderIfWalletNotConnected = () => (
    <h1 className="main-text">
      Give your audience<br></br>
      <span className="gradient-text">Solana</span> way<br></br>
      to say thanks 🤗
      <p className="sub-text">
        The fastest, easiest and decentralized way to say thanks.
      </p>
    </h1>
  );

  // Render creators list if user clicked explore creator button
  const renderExploreCreatorContainer = () => (
    <div className="creator-container">
      {creatorList.map((item, index) => (
        <div className="list-item" key={index} onClick={() => {
          console.log("Viewing...")
          setViewing(true)
          setCreatorIndex(index)
        }}>
          <img className="user-log" src={userLogo} alt="User"/>
          <div className="name-container">
            <div>{item.name.toString()}</div>
            <div className="name-container username">{item.username.toString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
  
  // Render this if user not creating account
  const renderSearchCreatorInputField = () => {
    if (creatorList !== null) {
      return(
        <form
            onSubmit={(event) => {
              event.preventDefault();
              console.log(inputValue);
              searchCreator()
            }}
        >
          <input type="text" placeholder="Search for creators" value={inputValue} onChange={onInputChange}/>
        </form>
      )
    }
  };

  // Render creator form if user wants to create account as creator
  const renderCreatorForm = () => (
    <div className="form-container">
      <div className="main-text">
        Create Your Creator Account
        <div className="form-if-title">
          Name
          <input className="form-if" placeholder="Enter your name" value={nameInputValue} onChange={onNameChange}/>
        </div>
        <div className="form-if-title">
          Username
          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendCreator()
            }}
          >
            <input className="form-if" placeholder="Enter your username" value={usernameInputValue} onChange={onUsernameChange}/>
          </form>
        </div>
      </div>
      <button className="button auth-button" onClick={() => {
        sendCreator()
      }}>
        Submit
      </button>
    </div>
  );

  // Render supporter form if user wants to create account as supporter
  const renderSupporterForm = () => (
    <div className="form-container">
      <div className="main-text">
        Create Your Creator Account
        <div className="form-if-title">
          Name
          <form
            onSubmit={(event) => {
              event.preventDefault()
              console.log(nameInputValue)
            }}
          >
            <input className="form-if" placeholder="Enter your name" value={nameInputValue} onChange={onNameChange}/>
          </form>
        </div>
      </div>
      <button className="button auth-button" onClick={() => {
        console.log(nameInputValue)
      }}>
        Submit
      </button>
    </div>
  );

  // Render buy container if supporters are viewing page
  const renderBuyContainer = () => (
    <div className="buy-container">
      <div className="bold-text"> 
      Buy {creatorList[creatorIndex].name.toString()} some Sol
      </div>
      <div className="buy-section">
        <div className="normal-text">Enter you message</div>
        <input className="message-box" placeholder="Say something  nice.....😎" value={msgInputValue} onChange={onMessageChange}/>
        <div className="normal-text">Enter amount</div>
        <form
            onSubmit={(event) => {
                event.preventDefault()
                // Send Message
                sendMessage()
            }}
          >
          <input className="message-box amount-box" placeholder="0" pattern="[0-9]{1,5}" value={amountInputValue} onChange={onAmountChange}/>
        </form>
      </div>
      <button className="button auth-button" onClick={
        () => {
          // Send Message
          sendMessage()
        }
      }>
        Support 0 SOL 
      </button>
    </div>
  );

  // Render creator page
  const renderCreatorPage = () => (
    <div className="main-container">
      <div className="profile-circle">
        <img className="user-log" src={userLogo} alt="User"/>
      </div>
      <div className="name-supporter-conatiner">
        <div className="cp-name-container">
          <div className="bold-text">{creatorList[creatorIndex].name.toString()}</div>
          <div className="normal-text">{creatorList[creatorIndex].username.toString()}</div>
        </div>
        <div className="sub-text">Hello 🤗<br/>
        Here’s my recent supporters 😎
        </div>
        <div className="supporter-box">
          <div className="list-item supporter-item">
            <img className="user-log" src={userLogo} alt="User"/>
            <div className="amount-message-container">
              <div className="normal-text">
                0kl76283jaskdas7asadas bought 0.5 Sol
              </div>
              <div className="message-container">
                Nice Work
              </div>
            </div>
          </div>
        </div>
      </div>
      {(creatorList[creatorIndex].userAddress.toString() !== walletAddress) && renderBuyContainer()}
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <button className="logo-text" onClick={
            () => {
              if (exploring) setExploring(false)
              if (creatingCreator) setCreatingCreator(false)
              if (creatingSupporter) setCreatingSupporter(false)
              if (viewing) setViewing (false)
            }
          }>
            Buy Me Sol
          </button>
          {!walletAddress && renderConnectWalletButton()}
          {!creatingCreator && !creatingSupporter && walletAddress  && renderExploreButton()}
        </div>
        <div className="body-container">
          {!viewing && !creatingCreator && !creatingSupporter && renderSearchCreatorInputField()}
          {viewing && renderCreatorPage()}
          <div className="main-container">
            {!walletAddress && renderIfWalletNotConnected()}
            {!exploring && !creatingCreator && !creatingSupporter && renderAuthContainer()}
            {!viewing && exploring && renderExploreCreatorContainer()}
            {creatingCreator && walletAddress && renderCreatorForm()}
            {creatingSupporter && walletAddress && renderSupporterForm()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
