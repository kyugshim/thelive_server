'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product.belongsToMany(models.order, {
        through: 'orderlist'
      })
      product.belongsToMany(models.user, {
        through: 'wishlist'
      })
      product.belongsToMany(models.broadcast, {
        through: 'live_product'
      })
    }
  };
  product.init({
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    price: DataTypes.INTEGER,
    tag: DataTypes.STRING,
    image: DataTypes.STRING,
    image2: DataTypes.STRING,
    image3: DataTypes.STRING,
    image4: DataTypes.STRING,
    image5: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    seller_nickname: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'product',
  });

  return product;
};