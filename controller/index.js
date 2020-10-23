const { user } = require('../models');
const { order } = require('../models');
const { product } = require('../models');
const { broadcast } = require('../models');
const { session } = require('../models'); // DB상에 존재하는 sessions 테이블을 sequelize에서 사용하기 위해, session 모델을 생성했습니다.
const { follow } = require('../models');
const { wishlist } = require('../models');

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
    signEditNickname: (req, res) => {
        const { nickname } = req.body;
        const session_userid = req.session.passport.user
        user.update({ nickname: nickname }, { where: { id: session_userid } })
            .then((data) => {
                console.log(data);
                res.status(200).json(data)
            })
            .catch((err) => {
                console.log(err);
                res.status(500);
            });
    },
    signEditPassword: (req, res) => {
        const { newpassword } = req.body;
        const session_userid = req.session.passport.user;
        /* 수 정 */
        user.update({ password: newpassword }, { where: { id: session_userid } })
            .then(() => {
                res.status(200).send("비밀번호 변경완료!")
            })
            .catch((err) => {
                console.log(err)
                res.status(400)
            })
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

    createProduct: (req, res) => {
        let userId = req.session.passport.user
        let { title, body, price, tags, image, image2, image3, quantity } = req.body

        product
            .create({
                title: title,
                body: body,
                price: price,
                tag: tags,
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
        order.create({})
    },

    createBroadcast: (req, res) => {
    }, // socket.io로 해결

    /**********   READ  ************/

    getUser: (req, res) => {
        user.create({})
    }, // userInfo로 대체 가능

    getProduct: (req, res) => {
        product.create({})
    },

    getOrder: (req, res) => {
        order.create({})
    },

    getBroadcast: (req, res) => {
        broadcast.create({})
    },

    /**********   UPDATE  ************/

    updateUser: (req, res) => {
        user.create({})
    },
    updateProduct: (req, res) => {
        product.create({})
    },

    updateOrder: (req, res) => {
        order.create({})
    },

    updateBroadcast: (req, res) => {
        broadcast.create({})
    },

    /**********   DELETE   ************/

    deleteUser: (req, res) => {
        user.create({})
    },
    deleteProduct: (req, res) => {
        product.create({})
    },

    deleteOrder: (req, res) => {
        order.create({})
    },

    deleteWishList: (req, res) => {
        let userId = req.session.passport.user
        let { productId } = req.body

        wishlist
            .destroy({
                where: {
                    userId: userId,
                    productId: productId
                }
            })
            .then(data => res.status(200).json(data))
            .catch(err => {
                console.log(err)
                res.status(400).send(err)
            })
    },

    deleteBroadcast: (req, res) => {
        broadcast.create({})
    },





}
