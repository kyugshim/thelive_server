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
      product.hasMany(models.order)
      product.belongsToMany(models.user, {
        through: 'whishlist'
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
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product',
  });

  return product;
};