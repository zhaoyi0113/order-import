const assert = require('assert');
const mongoUnit = require('mongo-unit');

const Controller = require('../src/controller');
const {OrderModel, CustomersModel} = require('../src/models');
const DBWriter = require('../src/db-writer');

// load test data
const dbData = require('./data/test.json');

describe('db writer test', () => {
  let controller;

  before(done => {
    mongoUnit
      .start()
      .then(url => (controller = new Controller(url)))
      .then(() => mongoUnit.load(dbData))
      .then(() => done());
  });

  after(() => mongoUnit.drop());

  it('test query customer ids', () => {
    const dbWriter = new DBWriter();
    return dbWriter.queryCustomers(['17', '18']).then(results => {
      assert.equal(results.length, 2);
      assert.equal(results[0].customerId, '17');
      assert.equal(results[1].customerId, '18');
    });
  });

  it('test query customer ids which dont exist', () => {
    const dbWriter = new DBWriter();
    return dbWriter.queryCustomers(['17', '999']).then(results => {
      assert.equal(results.length, 1);
      assert.equal(results[0].customerId, '17');
    });
  });

  it('test create orders', () => {
    const customers = [
      {
        _id: '5ab4b6ff172999cc0c4c6c99',
        customerId: '17',
        firstName: 'First Name 16',
        lastName: 'Last Name 16',
        __v: 0,
      },
      {
        _id: '5ab4b6ff172999cc0c4c6c9a',
        customerId: '18',
        firstName: 'First Name 17',
        lastName: 'Last Name 17',
        __v: 0,
      },
    ];
    const dbWriter = new DBWriter();
    const orders = dbWriter.createOrders(customers, {
      '17': '1,17,item1,100',
      '18': '2,18,item2,200',
      '18': '2,333,item2,200',
    });
    assert.equal(orders.length, 2);
    assert.equal(orders[0].orderId, '1');
    assert.equal(orders[1].orderId, '2');
  });

  it('test parse line data', done => {
    const lines = [
      '99997,99997,Item 99996,99997',
      '99998,99998,Item 99997,99998',
      '99999,99999,Item 99998,99999',
    ];
    const dbWriter = new DBWriter();
    const {idLines, customerIds} = dbWriter.parseData(lines);
    assert.equal(customerIds.length, 3);
    assert.equal(customerIds[0], '99997');
    assert.equal(customerIds[1], '99998');
    assert.equal(customerIds[2], '99999');

    assert.equal(idLines['99997'], '99997,99997,Item 99996,99997');
    assert.equal(idLines['99998'], '99998,99998,Item 99997,99998');
    assert.equal(idLines['99999'], '99999,99999,Item 99998,99999');

    done();
  });

  it('test write chunk', done => {
    // const writer = new DBWriter(dbConfig);
    // const lines = ['99987,99987,Item 99986,99987'];
    // writer.parseData(lines);
    console.log('done parse data');
    CustomersModel.find({customerId: '17'})
      .then(res => {
        console.log('get ret', res);
        assert.notEqual(res, null);
        done();
      })
      .catch(err => {
        console.error(err);
        done();
      });
  });
});
