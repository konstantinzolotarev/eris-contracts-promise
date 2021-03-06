'use strict'

const expect = require('chai').expect
const solc = require('solc')
const config = require('../config')

const Sample = `
  contract SampleContract {
    function add(int a, int b) constant returns (int sum) {
      sum = a + b;
    }
  }
`

describe('SampleContract :: ', () => {

  let SampleContract

  before(() => {
    const compiled = solc.compile(Sample, 1).contracts['SampleContract']
    expect(compiled).to.be.an('object')
    const abi = JSON.parse(compiled.interface)

    SampleContract = global.manager.newContract(abi, compiled.bytecode.toUpperCase())
  })

  it('should exist', () => {
    expect(SampleContract).to.be.an('object')

    expect(SampleContract.new).to.be.a('function')
    expect(SampleContract.at).to.be.a('function')
  })

  describe('SampleContract.at() :: ', () => {

    let contractAddress

    before(() => {
      const eris = global.manager.getEris()
      expect(eris).to.be.an('object')
      return eris
        .unsafe
        .transactAndHold(config.account.privKey, SampleContract.bytecode, '')
        .then((info) => {
          expect(info).to.be.an('object')
            .and.to.contain.all.keys([
              'tx_id', 'call_data'
            ])

          expect(info.call_data).to.be.an('object')
            .and.to.contain.all.keys([
              'callee', 'caller'
            ])

          contractAddress = info.call_data.callee
        })
    })

    it('reject without address', () => {
      return SampleContract
        .at()
        .then(() => Promise.reject())
        .catch((err) => {
          expect(err).to.be.an('error')
            .and.to.have.property('message', 'Address is required parameter')
        })
    })

    it('reject with wrong address', () => {
      return SampleContract
        .at('wrong-address')
        .then(() => Promise.reject())
        .catch((err) => {
          expect(err).to.be.an('error')
            .and.to.have.property('message', 'Address is required parameter')
        })
    })

    it('should create new contract', () => {
      return SampleContract
        .at(contractAddress)
        .then((contract) => {
          expect(contract).to.be.an('object')
            .and.to.have.property('address', contractAddress)
        })
    })

    it('should have add() method', () => {
      return SampleContract
        .at(contractAddress)
        .then((contract) => {
          expect(contract.add).to.be.a('function')
        })
    })

    it('add() should add numbers', () => {
      return SampleContract
        .at(contractAddress)
        .then((contract) => contract.add(1, 2))
        .then((result) => {
          expect(result.toNumber()).to.be.eq(3)
        })
    })

    it('should work with callback', (done) => {
      SampleContract
        .at(contractAddress)
        .then((contract) => {
          contract.add(1, 2, (err, res) => {
            if (err)
              return done(err)

            expect(res.toNumber()).to.be.eq(3)
            done()
          })
        })
        .catch((err) => done(err))
    })

  })

  describe('SampleContract.new() :: ', () => {

    it('should deploy new contract', () => {
      return SampleContract
        .new()
        .then((contract) => {
          expect(contract).to.be.an('object')
            .and.to.have.property('address')
        })
    })
  })

})
