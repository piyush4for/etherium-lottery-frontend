/* eslint-disable no-unused-vars */
import React, { Component } from 'react'
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {

  // constructor(props){
  //   super(props);

  //   this.state = {manager: ''};
  // }
  // alternative method for constructor in new es5 version
  state={
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };
  
  async componentDidMount() {
    //lifecycle method automatically call after render screen
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    

    this.setState({ manager, players, balance });
  }

  //we use this function as we dont have to worry about context of function
  onSubmit = async(e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();
//loading ... msg
    this.setState({ message: 'Waiting on transaction sucess...'});

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    })

    this.setState({ message: 'You have been enetered!!!'});

  }

  onClick = async() => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on trasaction succcess...'});

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked! '})
  };

render(){ 
  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>This contract is managed by manager: {this.state.manager}<br />
         There are currently {this.state.players.length} people entered, 
         competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
      </p>
      <hr />

      <form onSubmit={this.onSubmit}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <input 
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value})}
          />
          <p>minimum amount for participation: 0.01 ether </p>
        </div>
        <button>Enter</button>
      </form>
      <hr />

      <h4>Ready to pick a winner</h4>
      <button onClick={this.onClick}>Pick a winner!</button>

      <hr />

      <h1>{this.state.message}</h1>
    </div>
  );
 }
}
export default App;
