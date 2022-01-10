import './App.css';

const App = () => {
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <div className="logo-text">
            Buy Me Sol
          </div>
          <button className="button connect-wallet-button">
            Connect Wallet
          </button>
        </div>
        <div className="body-container">
          <input type="text" placeholder="Search for creators"/>
          <div className="main-container">
            <h1 className="main-text">
              Give your audience<br></br>
              <span className="gradient-text">Solana</span> way<br></br>
              to say thanks 🤗
              <p className="sub-text">
                The fastest, easiest and decentralized way to say thanks.
              </p>
            </h1>
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
