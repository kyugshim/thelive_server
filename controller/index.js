const { user } = require('../models');
const { order } = require('../models');
const { product } = require('../models');
const { broadcast } = require('../models');
const { session } = require('../models'); // DB상에 존재하는 sessions 테이블을 sequelize에서 사용하기 위해, session 모델을 생성했습니다.
const { follow } = require('../models');
const { wishlist } = require('../models');
const sequelize = require("sequelize");

 const Op = sequelize.Op;

module.exports = {
    signUp: (req, res) => {
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
    userInfo: (req, res) => {
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

    signEdit: (req, res) => {
        const { nickname , newPassword , address , addressDetail , phone , fullname } = req.body;
        const session_userid = req.session.passport.user
        const updateInfo = [ nickname , newPassword , address , addressDetail , phone , fullname ]

        updateInfo.forEach((info)=>{
            if(info){
                if(info === nickname){
                    user.update({
                        nickname : info
                        },{
                        where: {id: session_userid}
                        }
                    )
                }else if(info === newPassword){
                    user.update({
                        password : info
                        },{
                        where: {id: session_userid}
                        }
                    )
                }else if(info === address){
                    user.update({
                        address : info
                        },{
                        where: {id: session_userid}
                        }
                    )
                }else if(info === addressDetail){
                    user.update({
                        addressDetail : info
                        },{
                        where: {id: session_userid}
                        }
                    )
                }else if(info === phone){
                    user.update({
                        phone : info
                        },{
                        where: {id: session_userid}
                        }
                    )
                }else if(info === fullname){
                    user.update({
                        fullname : info
                        },{
                        where: {id: session_userid}
                        }
                    )
                }
            }
        })
        user.findOne({
            where: {id: session_userid}
        })
        .then(data => res.status(201).json(data))
        .catch(err => res.status(401).send(err))
    },

    signOut: (req, res) => {
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
    createUser: (req, res) => {
        user.create({})
    }, // Signup으로 대체 가능

    createFollow: (req, res) => {
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
        let userId = req.session.passport.user
        let { title, body, price, tags, image, image2, image3, quantity } = req.body

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
                userId: userId,
                broadcast: null
            })
            .then(data => res.status(200).json(data))
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    },

    createWishList: (req, res) => {
        let userId = req.session.passport.user
        let { productId } = req.body

        wishlist
            .create({ userId: userId, productId: productId })
            .then(data => res.status(200).json(data))
    },

    createOrder: (req, res) => {
        const { quantity, productId} = req.body
        const userId = req.session.passport.user
        user.findOne({
            where :{id : userId}
        })
        .then((data)=>{
            console.log(data);
            order.create({
               payment_status : "Start", // 상태설정 ...
               order_quantity: quantity,
               address: data.address,
               addressDtail: data.addressDetail,
               productId : productId,
               userId: userId
            })
            .then(data => res.status(200).send("주문성공"))
            .catch(err => res.status(400).send("주문실패"))
        })
    },


    /**********   READ  ************/

    getUser: (req, res) => {
        user.findOne({})
    }, // userInfo로 대체 가능

    getMyProduct: (req, res) => {
        const userId = req.session.passport.user
        product.findAll({
            where:{userId : userId},
        })
        .then((data) => {res.status(201).json(data)})
    },

    getAllProduct: (req, res) => {
        product.findAll({
            attributes: ['title', 'body', 'price', 'tag','image', 'image2', 'image3', 'quantity', 'userId']
        })
        .then(data => res.status(200).json(data));
    },

    getOrder: (req, res) => {
        const userId = req.session.passport.user
        order.findAll({
            where: {userId: userId},
            include: [{
                model: user,
                attributes: ['id', 'phone', 'email'], // user.hasmany(order) 관계에서 include가 되는지 확인 필요
            }]
        })
    },

    getFollowList: (req, res) => {
        const session_userid = req.session.passport.user
        user.findOne({
            where: { id: session_userid },
            include: [{
                model: user,
                as: 'friend',
                attributes: ['id', 'nickname', 'full_name', 'email'], 
                through: {
                    attributes: ['id', 'userId', 'friendId', 'block']
                }
            }]
        })
            .then((data) => {
                console.log(req.session)
                res.status(200).json(data);
            })
            .catch((err) => {
                console.log(req.session)
                console.log("목록을 불러오는데에 에러:", err);
                res.status(400).send("불러올 친구가 없나봅니다.human")
            })
    },

    searchProBro: (req, res) =>{
        const { searchString } = req.body;
        
        broadcast.findAll({
            where: {[Op.or] :[ 
                { title: {[Op.like]: [`%${searchString}%`] }},
                { body : {[Op.like]: [`%${searchString}%`] }}
                ]},
            // include:[product]
        })
        .then((broadcastList) => {
            product.findAll({
                where: {[Op.or] :[ 
                        { title: {[Op.like]: [`%${searchString}%`] }},
                        { body : {[Op.like]: [`%${searchString}%`] }}
                        ]},
                // include: [broadcast]
            })
            .then((productList) => {
                user.findAll({
                    where: {[Op.or]: [
                        { nickname: {[Op.like]: [`%${searchString}%`] }},
                        { fullname: {[Op.like]: [`%${searchString}%`] }}
                    ]}
                })
                .then((users) => {
                    let obj = {
                       broad : broadcastList,
                       product:productList,
                       user : users
                    }
                    res.status(200).json(obj)})
            })
            .catch(err => res.status(400).send('제품 검색오류.'))
        })
    },

    /**********   UPDATE  ************/

    updateUser: (req, res) => {
        user.create({})
    }, // signEdit 로 대체 가능

    updateIsSeller: (req, res) => {
        const session_userid = req.body.session.passport.user
        user.update({
            is_seller : 1
        },
        {
            where : {id : session_userid}
        })
        .then(()=> res.status(201).send("당신은 이제 seller입니다."))
        .catch(err => res.status(400).send(err))
    },

    updateProduct: (req, res) => {
        const {productId, title, body, price,image,image2,image3,tag, quantity} = req.body
        product.update({
            title: title,
            body: body,
            price: price,
            image: image,
            image2: image2,
            image3: image3,
            tag: tag,
            quantity: quantity
         },
         {
            where: {id: productId}
         })
         .then(()=> res.status(201).send('수정성공'))
         .catch((err)=> res.status(401).send(err))
    },

    /**********   DELETE   ************/

    deleteUser: (req, res) => {
        user.destroy({})
    }, // 아직 불가능

    deleteProduct: (req, res) => {
        const userId = req.session.passport.user
        const {productId} = req.body;
        product.destroy({
            where : {
                userId: userId, 
                id: productId
            }
        }).then(()=> res.status(200).send('삭제 성공'))
    },

    deleteOrder: (req, res) => {
        const userId = req.session.passport.user
        const {productId} = req.body;
        order.destroy({
            where: {
                userId : userId,
                productId: productId
            }
        })
    },

    deleteWishList: (req, res) => {
        const userId = req.session.passport.user
        const { productId } = req.body

        wishlist
            .destroy({
                where: {
                    userId: userId,
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
        const userId = req.session.passport.user
        broadcast.destroy({
            where: {userId: userId}
        })
        .then(data => res.status(200).send('삭제 성공'))
        .catch(err => {
                console.log(err)
                res.status(400).send(err)
        })
    },
}