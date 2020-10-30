const { user, order, product, broadcast, 
        session, follow, wishlist, live_product} = require('../models');

const stripe = require('stripe')('sk_test_odmJuviAAUXBjd3EDTQDosgr');
const sequelize = require('sequelize');
const Op = sequelize.Op;

module.exports = {
    signUp: (req, res) => { // OK
        const { email, password, fullname, nickname, phone, address, addressDetail, profileImage } = req.body;

        user.findOrCreate({
            where: {
                email: email,
            },
            defaults: {
                password: password,
                full_name: fullname,
                nickname: nickname,
                phone: phone,
                address: address,
                addressDetail: addressDetail,
                profileImage: profileImage
            }
        })
            .then(async ([user, created]) => {
                if (!created) {
                    return res.status(409).send("이미 존재하는 email입니다.");
                }
                const data = await user.get({ plain: true });
                console.log(req.session)
                res.status(201).json(data);
            });
    },
    userInfo: (req, res) => { // OK
        console.log('userinfo api work', req.session)
        const session_userid = req.session.passport.user;
        if (session_userid) {
            user.findOne({
                where: {
                    id: session_userid,
                },
            })
                .then((data) => {
                    if (data) {
                        return res.status(200).json(data);
                    }
                    res.sendStatus(204);
                })
                .catch((err) => {
                    console.log(err);
                    res.sendStatus(500);
                });
        } else {
            res.status(401).send("세션을 찾지 못했습니다.")
        }
    },

    signEdit: (req, res) => { // testing...
        const { nickname, newPassword, address, addressDetail, phone, fullname } = req.body;
        const session_userid = req.session.passport.user
        const updateInfo = [nickname, newPassword, address, addressDetail, phone, fullname]

        updateInfo.forEach((info) => {
            if (info) {
                if (info === nickname) {
                    user.update({
                        nickname: info
                    }, {
                        where: { id: session_userid }
                    }
                    )
                } else if (info === newPassword) {
                    user.update({
                        password: info
                    }, {
                        where: { id: session_userid }
                    }
                    )
                } else if (info === address) {
                    user.update({
                        address: info
                    }, {
                        where: { id: session_userid }
                    }
                    )
                } else if (info === addressDetail) {
                    user.update({
                        addressDetail: info
                    }, {
                        where: { id: session_userid }
                    }
                    )
                } else if (info === phone) {
                    user.update({
                        phone: info
                    }, {
                        where: { id: session_userid }
                    }
                    )
                } else if (info === fullname) {
                    user.update({
                        fullname: info
                    }, {
                        where: { id: session_userid }
                    }
                    )
                }
            }
        })
        user.findOne({
            where: { id: session_userid }
        })
            .then(data => res.status(201).json(data))
            .catch(err => res.status(401).send(err))
    },

    signOut: (req, res) => { // testing..
        const userSession = req.session;
        console.log(req.session)
        session.destroy({
            where: {
                data: JSON.stringify(userSession)
            }
        }).
            then(result => {
                userSession.destroy();
                res.status(200).send("정상적으로 로그아웃했습니다.")
            })
            .catch(err => {
                console.log(err)
                res.status(400).end("로그아웃 중 에러가 발생했습니다.")
            })

    },




    /**********   CREATE   ************/

    createFollow: (req, res) => { // testing..
        const { sellerId } = req.body;
        const session_userid = req.session.passport.user

        follow.create({
            userId: session_userid,
            followerId: sellerId
        })
            .then((data) => {
                res.status(200).json(data)
            })
            .catch((err) => {
                console.log("id 조회 실패", err)
                res.status(400).send("일치하는 id가 없습니다.")
            })
    },

    createProduct: (req, res) => {
        const session_userid = req.session.passport.user
        const { title, body, price, tags, image, image2, image3, quantity } = req.body

        product
            .create({
                title: title,
                body: body,
                price: price,
                tag: JSON.stringify(tags),
                image: image,
                image2: image2,
                image3: image3,
                quantity: quantity,
                userId: session_userid,
                broadcast: null
            })
            .then(data => res.status(200).json(data))
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    },

    createWishList: (req, res) => {
        const session_userid = req.session.passport.user
        const { productId } = req.body

        wishlist
            .create({ userId: session_userid, productId: productId })
            .then(data => res.status(200).json(data))
    },

    createOrder: (req, res) => {
        const { quantity, productId, amount, sellerId } = req.body
        const  session_userid = req.session.passport.user
        user.findOne({
            where: { id:  session_userid }
        })
            .then((data) => {
                console.log(data);
                order.create({
                    payment_status: "Start", // 상태설정
                    order_quantity: quantity,
                    address: data.address,
                    addressDtail: data.addressDetail,
                    productId: productId,
                    userId: session_userid,
                    sellerId: sellerId,
                    amount: amount,
                    customer_phone: data.phone
                })
                .then(order => {
                    product.findOne({
                        where: {id : productId}
                    })
                    .then(product =>{
                        order.addProducts(product)
                    })
                    .then(()=>{
                        res.status(200).send("주문성공")
                    })
                    .catch(err => res.status(400).send("주문실패"))
            })
        })
    },
    // stripe 결제 후에 실행 시키기 

    createLiveProduct : (req, res) =>{
        const {broadcastId, productId} = req.body

        live_product.create({
            broadcastId: broadcastId,
            productId: productId
        })
        .then(()=>{
            res.status(200).send("상품등록")
        })
        .catch(err => {
            res.status(404).send(err)
        })
    },


    /**********   READ  ************/

    getMyProduct: (req, res) => {
        const  session_userid = req.session.passport.user
        product.findAll({
            where: { userId:  session_userid },
        })
            .then((data) => { res.status(201).json(data) })
    },

    getAllProduct: (req, res) => {
        product.findAll({
            attributes: ['title', 'body', 'price', 'tag', 'image', 'image2', 'image3', 'quantity', 'userId']
        })
            .then(data => res.status(200).json(data));
    },

    getOrder: (req, res) => {
        const  session_userid = req.session.passport.user
        order.findAll({
            where: { userId: session_userid },
            include: [{
                model: product,
                attributes: ['id', 'title', 'body'], // user.hasmany(order) 관계에서 include가 되는지 확인 필요
            }]
        })
        .then((data)=>{res.status(200).json(data)})
        .catch(err=>{res.status(400).send(err)})
    },

    getSellerOrder:(req, res) =>{
        const  session_userid = req.session.passport.user
         order.findAll({
             where : {sellerId: session_userid},
             include: [{
                model: product,
            }]
         })
         .then((data)=>{res.status(200).json(data)})
         .catch(err=>{res.status(400).send(err)})
    },

    getFollowList: (req, res) => {
        const session_userid = req.session.passport.user
        user.findOne({
            where: { id: session_userid },
            include: [{
                model: user,
                as: 'follower',
                attributes: ['id', 'nickname', 'fullname', 'email'],
                through: {
                    attributes: ['userId', 'followerId']
                }
            }]
        })
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                console.log("목록을 불러오는데에 에러:", err);
                res.status(400).send("불러올 친구가 없나봅니다.human")
            })
    },

    searchProBro: (req, res) => {
        const { searchString } = req.body;

        broadcast.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: [`%${searchString}%`] } },
                    { body: { [Op.like]: [`%${searchString}%`] } }
                ]
            },
            // include:[product]
        })
            .then((broadcastList) => {
                product.findAll({
                    where: {
                        [Op.or]: [
                            { title: { [Op.like]: [`%${searchString}%`] } },
                            { body: { [Op.like]: [`%${searchString}%`] } }
                        ]
                    },
                    // include: [broadcast]
                })
                    .then((productList) => {
                        user.findAll({
                            where: {
                                [Op.or]: [
                                    { nickname: { [Op.like]: [`%${searchString}%`] } },
                                    { fullname: { [Op.like]: [`%${searchString}%`] } }
                                ]
                            }
                        })
                            .then((users) => {
                                let obj = {
                                    broad: broadcastList,
                                    product: productList,
                                    user: users
                                }
                                res.status(200).json(obj)
                            })
                    })
                    .catch(err => res.status(400).send('제품 검색오류.'))
            })
    },

    /**********   UPDATE  ************/

    updateSeller: (req, res) => {
        const session_userid = req.session.passport.user
        const { bankBrand , account } = req.body
        user.findOne({
            where: {
                id: session_userid
            }
        })
            .then(data => {
                if (data.is_seller) {
                    data.update({ 
                        is_seller: 0,
                        bank_brand: '',
                        account: ''
                    })
                        .then(() => {
                            product.destroy({
                                where: {userId: session_userid}
                            })
                           .then(()=>{
                              broadcast.destroy({
                                where : { userId: session_userid }
                              })
                              .then(()=> follow.destroy({
                                  where: { followerId :session_userid }
                              }))
                            })
                            .then(()=> res.status(200).end())
                        })
                } else {
                    data.update({ 
                        is_seller: 1,
                        bank_brand: bankBrand,
                        account: account
                     })
                        .then(() => res.status(200).end())
                }
            })
            .catch(err => {
                console.log(err)
                res.status(400).end();
            })
    },

    // updateProduct: (req, res) => {
    //     const { productId, title, body, price, image, image2, image3, tag, quantity } = req.body
    //     product.update({
    //         title: title,
    //         body: body,
    //         price: price,
    //         image: image,
    //         image2: image2,
    //         image3: image3,
    //         tag: tag,
    //         quantity: quantity
    //     },
    //         {
    //             where: { id: productId }
    //         })
    //         .then(() => res.status(201).send('수정성공'))
    //         .catch((err) => res.status(401).send(err))
    // },

    /**********   DELETE   ************/

    deleteUser: (req, res) => {
        user.destroy({})
    }, // 아직 불가능

    deleteProduct: (req, res) => {
        const session_userid = req.session.passport.user
        const { productId } = req.body;
        product.destroy({
            where: {
                userId: session_userid,
                id: productId
            }
        }).then(() => res.status(200).send('삭제 성공'))
    },

    deleteOrder: (req, res) => {
        const session_userid = req.session.passport.user
        const { productId } = req.body;
        order.destroy({
            where: {
                userId: session_userid,
                productId: productId
            }
        })
    },

    deleteWishList: (req, res) => {
        const session_userid = req.session.passport.user
        const { productId } = req.body

        wishlist
            .destroy({
                where: {
                    userId: session_userid,
                    productId: productId
                }
            })
            .then(data => res.status(200).send('삭제 성공'))
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    },

    deleteBroadcast: (req, res) => {
        const session_userid = req.session.passport.user
        broadcast.destroy({
            where: { userId: session_userid }
        })
            .then(data => res.status(200).send('삭제 성공'))
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    },


    /*********** multer **************/

    postAvatarImage: async (req, res) => {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        const {id} = req.body;
  
        try {
          const avatar = req.file;
          await user.uptdate(
              {profile_image: "/profile/"+ req.file.filename},
              {where: {id : id}})
          // make sure file is available
          if (!avatar) {
            res.status(400).send('No file is selected.');
          } else {
            // send response
            res.status(200).send( 'File is uploaded.');
          }
      
        } catch (err) {
          res.status(500).send(err);
        }
    },

    getAvatarImage: (req,res) =>{
       const session_userid = req.session.passport.user
       user.findOne({
           where: {id : session_userid}
       })
       .then((user)=>{
           res.status(200).json(user.profile_image);
       })
    },



   postProductImage: async (req, res) => {
        // req.files is array of `photos` files
        // req.body will contain the text fields, if there were any
        console.log(req);
        try {
          const products = req.files;
          const { productId } = req.body;
          // make sure file is available
          if (!products.length) {
            res.status(400).send({
              status: false,
              data: 'No file is selected.'
            });
          } else {
            // send response
            let data = [];

            for(let i=0 ; i< products.length; i++){
                if(i === 0){
                 await product.update(
                     {image: "/products/"+ products[i].filename},
                     {where: {id: productId}}
                 )
               }
               else if (i === 1){
                   await product.update(
                       {image2: "/products/"+ products[i].filename},
                       {where: {id: productId}}
                   )
               }
               else if( i === 2){
                   await product.update(
                       {image3: "/products/"+ products[i].filename},
                       {where: {id: productId}}
                   )
               }
               else if( i === 3){
                   await product.update(
                       {image4: "/products/"+ products[i].filename},
                       {where: {id: productId}}
                   )
               }
               else if( i === 4){
                   await product.update(
                       {image5: "/products/"+ products[i].filename},
                       {where: {id: productId}}
                   )
               }
            }
      
            products.map(p => {
              data.push({
                originalname: p.originalname,
                encoding: p.encoding,
                mimetype: p.mime,
                destination: p.destination,
                filename: p.filename,
                path: p.path,
                size: p.size
              })
            });
            res.status(200).send({
              status: true,
              message: 'File is uploaded.',
              data: data
            });
          }
      
        } catch (err) {
          console.log(err)
          res.status(500).send(err);
        }
      },

      getProductImage : (req, res) =>{
          const { id } =  req.body

          prodduct.findOne({
              where: {id : id}
          })
          .then((product)=>{
              let { image, image2, image3, image4, image5 } = product;
              let imageArray = [];
           
              for(let i =0; i<5; i++){
                  if(image){
                    imageArray.push(image)
                  }
                  else if(image2){
                    imageArray.push(image2)
                  }
                  else if(image3){
                    imageArray.push(image3)
                  }
                  else if(image4){
                    imageArray.push(image4)
                  } 
                  else if(image5){
                    imageArray.push(image5)
                  }
              }

              res.status(200).json(imageArray)

          })
          .catch((err)=>{
              res.status(404).send(err)
          })
      },
      


    /********** stripe ************/

    dopayment: (req, res) => {
        const  session_userid = req.session.passport.user
        const tokenId = req.body.tokenInfo.tokenId
         user.findOne({
             where:{ id: session_userid }
         })
         .then((data) => {
             if(!data.stripeId){
                return stripe.customers.find({
                    email: data.email,
                    // source: token.card.cardId
                })
                .then((stCu)=>{
                    console.log(stCu)
                    data.update({stripeId: stCu.id})
                    return stripe.customers.createSource(stCu.id,{
                        source: tokenId
                    })
                    .then(()=>{
                        return stripe.charges.create({
                            amount: req.body.amount,
                            currency: 'krw',
                            customer: stCu.id,
                            // source: stCu.default_source,
                            description: 'Test payment',
                        })
                        .then(result => res.status(200).json(result))
                        .catch(err => res.status(400).send(err))
                    })
                })
             }else if(data.stripeId){
                return stripe.charges.create({
                    amount: req.body.amount,
                    currency: 'krw',
                    customer: data.stripeId,
                    // source: stCu.default_source,
                    description: 'Test payment',
                })
                .then(result => res.status(200).json(result))
                .catch(err => res.status(400).send(err))
            }
        })
     }
}