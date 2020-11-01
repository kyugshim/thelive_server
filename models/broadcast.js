'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class broadcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      broadcast.belongsToMany(models.product, {
        through: 'live_product'
      })
    }
  };
  broadcast.init({
    title: {
      type: DataTypes.STRING,
      unique: true
    },
    body: DataTypes.STRING,
    status: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    countViewer: {
      type: DataTypes.INTEGER,
      default: 1,
    },
    countHeart: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    userId : DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'broadcast',
  });
  return broadcast;
};