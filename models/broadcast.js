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
      broadcast.belongsTo(models.user)
      
      broadcast.hasMany(models.product)
    }
  };
  broadcast.init({
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    status: DataTypes.STRING,
    watching: DataTypes.INTEGER,
    messages:  { 
      type: DataTypes.STRING, 
      get: function() {
          return JSON.parse(this.getDataValue('messages'));
      }, 
      set: function(val) {
          return this.setDataValue('messages', JSON.stringify(val));
      }
    },
    countViewer: {
      type: DataTypes.INTEGER,
      default: 1,
    },
    countHeart: {
      type: DataTypes.INTEGER,
      default: 0,
    }
  }, {
    sequelize,
    modelName: 'broadcast',
  });
  return broadcast;
};