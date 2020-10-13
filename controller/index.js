module.exports = {
    signUp: (req, res) => {
        const { email, password, fullname, nickname, phone, address, profileImage } = req.body;

        user.findOrCreate({
            where: {
                email: email,
            },
            defaults: {
                password: password,
                full_name: fullname,
                nickname: nickname,
                phone: phone,
                address: address
            }
        })
            .then(async ([user, created]) => {
                if (!created) {
                    console.log(req.session.passport.user)
                    return res.status(409).send("이미 존재하는 email입니다.");
                }
                const data = await user.get({ plain: true });
                console.log(req.session)
                res.status(201).json(data);
            });
    },
    // mypage: (req, res) => {
    //     const session_userid = req.session.passport.user;
    //     if (session_userid) {
    //         user.findOne({
    //             where: {
    //                 id: session_userid,
    //             },
    //         })
    //             .then((data) => {
    //                 if (data) {
    //                     return res.status(200).json(data);
    //                 }
    //                 res.sendStatus(204);
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 res.sendStatus(500);
    //             });
    //     } else {
    //         res.status(401).send("세션을 찾지 못했습니다.")
    //     }
    // },
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
    signOutController: (req, res) => {
        const session_userid = req.session.passport.user;
        if (session_userid) {
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    res.status(400).send("로그아웃 실패!")
                } else {
                    res.status(200).send("로그아웃 성공")
                }
            });
        }
    },

    

}
