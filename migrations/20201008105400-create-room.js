'use strict';

const { sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userName: {
        type: Sequelize.STRING
      },
      roomName: {
        type: Sequelize.STRING
      },
      liveStatus: {
        type: Sequelize.INTEGER
      },
      filePath: {
        type: Sequelize.STRING
      },
      messages: {
        type: Sequelize.STRING
      },
      counterViewer: {
        type: Sequelize.INTEGER
      },
      countHeart: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Rooms');
  }
};