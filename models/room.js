'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Room.init({
    userName: DataTypes.STRING,
    roomName: DataTypes.STRING,
    liveStatus: DataTypes.NUMBER,
    filePath: DataTypes.STRING,
    messages: DataTypes.STRING,
    counterViewer: DataTypes.NUMBER,
    countHeart: DataTypes.NUMBER,
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};