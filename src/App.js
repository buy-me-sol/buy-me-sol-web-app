import React, { useState, useEffect } from 'react';
import userLogo from './assets/user.svg';
import './App.css';

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [exploring, setExploring] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [creatingCreator, setCreatingCreator] = useState(false);
  const [creatingSupporter, setCreatingSupporter] = useState(false);

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

  // Render Connect Wallet Button
  const renderConnectWalletButton = () => (
    <button className="button gradient-button" onClick={connectWallet}>
      Connect Wallet
    </button>
  );

  // If wallet is connect, render explore creator button
  const renderExploreButton = () => (
    <button className="button gradient-button" onClick={() => setExploring(true)}>
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
      <div className="list-item">
        <img className="user-log" src={userLogo} alt="User"/>
        <div className="name-container">
          <div> Hello</div>
          <div className="name-container username"> Hello</div>
        </div>
      </div>
    </div>
  );

  const renderSerachCreatorInputField = () => (
    <form
        onSubmit={(event) => {
          event.preventDefault();
          console.log(inputValue);
        }}
    >
      <input type="text" placeholder="Search for creators" value={inputValue} onChange={onInputChange}/>
    </form>
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
            }
          }>
            Buy Me Sol
          </button>
          {!walletAddress && renderConnectWalletButton()}
          {!creatingCreator && !creatingSupporter && walletAddress  && renderExploreButton()}
        </div>
        <div className="body-container">
          {!creatingCreator && !creatingSupporter && renderSerachCreatorInputField()}
          <div className="main-container">
            {!walletAddress && renderIfWalletNotConnected()}
            {!exploring && !creatingCreator && !creatingSupporter && renderAuthContainer()}
            {exploring && renderExploreCreatorContainer()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
