const assert = require('assert');
const mongoUnit = require('mongo-unit');

const Controller = require('../src/controller');
const {OrderModel, CustomersModel} = require('../src/models');
const DBWriter = require('../src/db-writer');

// load test data
const dbData = require('./data/test.json');
const mockDb = require('./db-mock');

describe('db writer test', () => {
  let controller;

  before(() => mockDb().then(ctr => (controller = ctr)));

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
    const orders = dbWriter.createOrders(customers, [
      {
        orderId: '1',
        customerId: '17',
        item: 'item1',
        quantity: 100,
      },
      {
        orderId: '2',
        customerId: '18',
        item: 'item2',
        quantity: 100,
      },
      {
        orderId: '3',
        customerId: '18',
        item: 'item3',
        quantity: 100,
      },
    ]);
    assert.equal(orders.length, 3);
    assert.equal(orders[0].orderId, '1');
    assert.equal(orders[1].orderId, '2');
    assert.equal(orders[2].orderId, '3');
  });

  it('test parse line data', () => {
    const lines = [
      '99997,99997,Item 99996,99997',
      '99998,99998,Item 99997,99998',
      '99999,99999,Item 99998,99999',
    ];
    const dbWriter = new DBWriter();
    const {validOrders, customerIds} = dbWriter.parseData(lines);
    assert.equal(customerIds.length, 3);
    assert.equal(customerIds[0], '99997');
    assert.equal(customerIds[1], '99998');
    assert.equal(customerIds[2], '99999');

    assert.equal(validOrders.length, 3);
    assert.deepEqual(validOrders[0], {
      orderId: '99997',
      customerId: '99997',
      item: 'Item 99996',
      quantity: '99997',
    });
    assert.deepEqual(validOrders[1], {
      orderId: '99998',
      customerId: '99998',
      item: 'Item 99997',
      quantity: '99998',
    });
    assert.deepEqual(validOrders[2], {
      orderId: '99999',
      customerId: '99999',
      item: 'Item 99998',
      quantity: '99999',
    });
  });

  it('test find 0 orders', () => {
    const dbWriter = new DBWriter();
    let orders = dbWriter.createOrders(
      [],
      [
        {
          orderId: '99997',
          customerId: '99997',
          item: 'Item 99996',
          quantity: '99997',
        },
      ]
    );
    assert.equal(orders.length, 0);

    orders = dbWriter.createOrders([], {});
    assert.equal(orders.length, 0);
  });
});
