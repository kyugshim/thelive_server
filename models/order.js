'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      order.belongsToMany(models.product, {
        through: 'orderlist'
      })
    }
  };
  order.init({
    payment_status: DataTypes.STRING,
    order_quantity: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    address: DataTypes.STRING,
    addressDtail: DataTypes.STRING,
    productId: DataTypes.INTEGER,
    userId : DataTypes.INTEGER,
    sellerId: DataTypes.INTEGER,
    customer_phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'order',
  });
  return order;
};