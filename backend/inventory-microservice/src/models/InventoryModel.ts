const db = require('../clients/postgres');
const { DataTypes } = require('sequelize');

const Inventory = db.define('inventory', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    styleid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    colour: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shoesize: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    purchaseprice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tax: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shipping: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    purchasedate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ordernumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    markedsold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'inventory',
    updatedAt: false,
    createdAt: false,
    timestamps: false,
  }
);

module.exports = Inventory;
