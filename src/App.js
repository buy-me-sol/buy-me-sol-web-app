import React, { useState, useEffect } from 'react';
import userLogo from './assets/user.svg';
import './App.css';

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

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

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
  const renderAuthContainer = () => (
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
  );

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
      <div className="list-item" onClick={() => {
        console.log("Viewing...")
        setViewing(true)
      }}>
        <img className="user-log" src={userLogo} alt="User"/>
        <div className="name-container">
          <div> Hello</div>
          <div className="name-container username"> Hello</div>
        </div>
      </div>
    </div>
  );
  
  // Render this if user not creating account
  const renderSearchCreatorInputField = () => (
    <form
        onSubmit={(event) => {
          event.preventDefault();
          console.log(inputValue);
        }}
    >
      <input type="text" placeholder="Search for creators" value={inputValue} onChange={onInputChange}/>
    </form>
  );

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
              console.log(nameInputValue)
              console.log(usernameInputValue)
            }}
          >
            <input className="form-if" placeholder="Enter your username" value={usernameInputValue} onChange={onUsernameChange}/>
          </form>
        </div>
      </div>
      <button className="button auth-button" onClick={() => {
        console.log(nameInputValue)
        console.log(usernameInputValue)
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
      Buy Apratim Mehta some Sol
      </div>
      <div className="buy-section">
        <div className="normal-text">Enter you message</div>
        <input className="message-box" placeholder="Say something  nice.....😎"/>
        <div className="normal-text">Enter amount</div>
        <input className="message-box amount-box" placeholder="0"/>
      </div>
      <button className="button auth-button">
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
          <div className="bold-text">Name</div>
          <div className="normal-text">Username</div>
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
                I want to acknowledge everyone's extra effort.
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderBuyContainer()}
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
