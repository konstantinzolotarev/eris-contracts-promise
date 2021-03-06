'use strict'

const eris = require('eris-db-promise')
const _ = require('lodash')
const util = require('./util')
const Contract = require('./Contract')

/**
 * ContractManager
 * @type {ContractManager}
 */
module.exports = class ContractManager {

  /**
   * @param {Srting} rpcUrl
   * @param {Object} account
   */
  constructor (rpcUrl, account) {
    this._rpcUrl = rpcUrl
    this._erisdb = eris.createInstance(rpcUrl)
    this._account = account
  }

  /**
   * Get erisDB instance
   * @return {ErisDB}
   */
  getEris () {
    return this._erisdb
  }

  /**
   * Will create new Contract instance
   * @param {Array} abi
   * @param {String} bytecode
   * @param {String} address
   * @return {Contract}
   */
  newContract (abi, bytecode, address) {
    if (!_.isArray(abi))
      throw new Error('ABI is required parameter')

    if (bytecode && !util.isHex(bytecode))
      throw new Error('Bytecode have to be a HEX string')

    if (address && !util.isAddress(address))
      throw new Error('Address have to be a valid address')

    const params = {
      abi: abi,
      bytecode: bytecode,
      account: this._account,
      address: address || ''
    }
    return new Contract(params, this._erisdb)
  }

}
