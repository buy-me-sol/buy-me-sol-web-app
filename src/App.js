import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);

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

  const renderConnectWalletButton = () => (
    <button className="button gradient-button" onClick={connectWallet}>
      Connect Wallet
    </button>
  );

  const renderExploreButton = () => (
    <button className="button gradient-button" onClick={null}>
      Explore Creators
    </button>
  );

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

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <div className="logo-text">
            Buy Me Sol
          </div>
          {!walletAddress && renderConnectWalletButton()}
          {walletAddress && renderExploreButton()}
        </div>
        <div className="body-container">
          <input type="text" placeholder="Search for creators"/>
          <div className="main-container">
            {!walletAddress && renderIfWalletNotConnected()}
            <div className="auth-container">
              <h1 className="main-text">
                Who are you?
              </h1>
              <div className="button-container">
                <button className="button auth-button">
                  Creator
                </button>
                <button className="button auth-button">
                  Supporter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
