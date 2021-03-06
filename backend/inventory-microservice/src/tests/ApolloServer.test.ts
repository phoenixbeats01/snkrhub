export {}

const { ApolloServer } = require('apollo-server-express');
const { resolvers } = require('../schema/resolvers')
const { typeDefs } = require('../schema/typeDefs')
const dayjs = require('dayjs')
import * as core from '@actions/core';

// Database
const db = require('../clients/postgres');
const Inventory = require('../models/inventoryModel');

describe('tests reading inventory items', () => {  
  beforeAll(async () => {
    // Regenreate database
    await db.sync({ force: true })

    // Generate mock data
    const item = {
        user_id: "testUserId",
        name: "Nike air force",
        styleid: "DHAG",
        brand: "Nike",
        colour: "Black/White",
        condition: "Used",
        shoesize: 11,
        purchaseprice: 110,
        tax: 10,
        shipping: 0.00,
        purchasedate: "2022-11-02",
        ordernumber: "sadfsdfsdf",
        markedsold: false,
        createdAt: dayjs().locale('en').format("YYYY-MM-DD")
      }
      await Inventory.bulkCreate([item, item, item, item]);
  })

  it('queries inventory items with fetchUserInventoryItems query', async () => {
    try {
      const testServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ userId: 'testUserId' }),
      });
  
      // Query for first 2 items 
      const result = await testServer.executeOperation({
        query: `
          query Query($offset: Int!, $limit: Int!) {
            fetchUserInventoryItems(offset: $offset, limit: $limit) {
              id
            }
          }
        `,
        variables: {  
          offset: 0,
          limit: 2,
          userId: "testUserId"
        }
      });
  
      // Expect 2 results
      expect(result.data?.fetchUserInventoryItems).toMatchObject([{ "id": 1 }, { "id": 2 }]);
    } catch (error: any) {
      core.setFailed(error);
    }
  });
})

describe('tests creating inventory items', () => {
  beforeAll(async () => {
    // Regenreate database
    await db.sync({ force: true })
  })

  it('creates an inventory item with addInventoryItem mutation', async () => {
    try {
      const testServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ userId: 'testUserId' }),
      });

      const result = await testServer.executeOperation({
        query: `
          mutation AddInventoryItem($inventoryItem: InventoryItemInput!) {
            addInventoryItem(inventoryItem: $inventoryItem) {
              id
            }
          }
        `,
        variables: {
          inventoryItem: {
            name: "Nike air force",
            styleid: "DHAG",
            brand: "Nike",
            colour: "Black/White",
            condition: "Used",
            shoesize: 11,
            purchaseprice: 110,
            tax: 10,
            shipping: 0.00,
            purchasedate: "2022-11-02",
            ordernumber: "sadfsdfsdf",
          }
        },
      })

      expect(result.data?.addInventoryItem).toMatchObject({ "id": 1 });
    } catch (error: any) {
      core.setFailed(error);
    }
  });
});

describe('tests deleting inventory items', () => {
  it('deletes an inventory item with deleteInventoryItem mutation', async () => {
    try {
      const testServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ userId: 'testUserId' }),
      });
  
      const result = await testServer.executeOperation({
        query: `
          mutation DeleteInventoryItem($itemId: Int!) {
            deleteInventoryItem(itemId: $itemId) {
              id  
            }
          }
        `,
        variables: {
          itemId: 1
        },
      });
  
      expect(result.data?.deleteInventoryItem).toMatchObject({ "id": 1 });
    } catch (error: any) {
      core.setFailed(error);
    }
  });
});

describe('tests marking inventory item as sold', () => {
  beforeAll(async () => {
    // Regenreate database
    await db.sync({ force: true })

    // Generate mock data
    const item = {
      user_id: "testUserId",
      name: "Nike air force",
      styleid: "DHAG",
      brand: "Nike",
      colour: "Black/White",
      condition: "Used",
      shoesize: 11,
      purchaseprice: 110,
      tax: 10,
      shipping: 0.00,
      purchasedate: "2022-11-02",
      ordernumber: "sadfsdfsdf",
      markedsold: false,
      createdAt: dayjs().locale('en').format("YYYY-MM-DD")
    }
    await Inventory.create(item);
  })

  it('marks an inventory item as sold', async () => {
    try {
      const testServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({ userId: 'testUserId' }),
      });
  
      const result = await testServer.executeOperation({
        query: `
          mutation MarkInventoryItemSold($itemId: Int!) {
            markInventoryItemSold(itemId: $itemId) {
              id
            }
          }
        `,
        variables: {
          itemId: 1
        },
      });
  
      expect(result.data?.markInventoryItemSold).toMatchObject({ "id": 1 });
    } catch (error: any) {
      core.setFailed(error);
    }
  });
});

// Closing the DB connection allows Jest to exit successfully.
afterAll((done) => {
  db.close()
  done()
})