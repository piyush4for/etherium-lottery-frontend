//we are using test.js just to verify the transaction as it is important
const { equal } = require('assert');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } =require('../compile');

let Lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    Lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0],  gas: '1000000'});

        Lottery.setProvider(provider)
});

describe('Lottery Contract', () =>{
    it('deploys a contract', ()=>{
        assert.ok(Lottery.options.address);
    });

    it('allows one account to enter', async ()=>{
        await Lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        const players = await Lottery.methods.getPlayers().call({
            from:  accounts[0]
        });
        
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple account to enter', async ()=>{
        await Lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await Lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await Lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        const players = await Lottery.methods.getPlayers().call({
            from:  accounts[0]
        });
        
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether to enter', async ()=>{
       try {
        await Lottery.methods.enter().send({
            from: accounts[0],
            value: 0
        });
        assert(false); //our test would fail if this line runned
       } catch (error) {
           assert(error);
       }
    }); 

    it('only manager can call pickwineer', async ()=>{
        //this too is checking of error if error then test pass
        try {
            await Lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('sends money to winner ', async ()=>{
        await Lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await Lottery.methods.pickWinner().send({ from: accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        //difference would be not exactly 2 ether as used in gas
        const difference = finalBalance-initialBalance;
        // console.log(difference);
        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
    //can create more test on reset player array,lootery balance is 0
});