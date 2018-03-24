const assert = require('assert');
const mongoUnit = require('mongo-unit');

const Controller = require('../src/controller');
const {OrderModel, CustomersModel} = require('../src/models');
const mockDb = require('./db-mock');

describe('test controller', () => {
  let controller;

  before(() => mockDb().then(ctr => (controller = ctr)));

  after(() => mongoUnit.drop());

  it('test process data', () => {
    return controller
      .process('./test/data/test.csv')
      .then(() => {
        return OrderModel.find();
      })
      .then(orders => {
				console.log(orders);
        assert.equal(orders.length, 7);
			});
  });
});
