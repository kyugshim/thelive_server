'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class session extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        }
    };
    session.init({
        session_id: DataTypes.STRING,
        expires: DataTypes.INTEGER,
        data: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'session',
    });
    return session
};