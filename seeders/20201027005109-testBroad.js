'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   let datas = [];
   for(let i = 0; i < 10; i++){
     let obj = {
       title: "Live방송" + i ,
       body: "testBody" + i,
       status: "ON",
       thumbnail: "/thumbnail/" + "test" + i +".png",
       createdAt: new Date(),
       updatedAt: new Date()
     }
     datas.push(obj)
   }

   return queryInterface.bulkInsert('broadcasts', datas, {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
