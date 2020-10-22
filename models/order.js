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
    }
  };
  order.init({
    payment_status: DataTypes.STRING,
    order_quantity: DataTypes.INTEGER,
    address: DataTypes.STRING,
    addressDtail: DataTypes.STRING
    // customer_phone: DataTypes.INTEGER . include 로 user의 폰 가져오기
  }, {
    sequelize,
    modelName: 'order',
  });
  return order;
};