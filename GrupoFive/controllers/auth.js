const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

exports.login = async (req, res) => {
    try {
     
     const { email, password } = req.body
        if(!email || !password) {
            return res.status(400).render('login', {
                message_error: 'Por favor forneça um email e senha'
            })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results)
            if(!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message_error: 'Email ou Senha está incorreto!'
                })
            } else {
                const id = results[0].id

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })

                console.log("O token é: "+token)

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions)
                res.status(200).redirect('/dashboard')
            }
        })


    } catch (error) {
       console.log(error) 
    }
}

exports.registro = (req, res) => {
    console.log(req.body)

    const { username, email, password, password2 } = req.body

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error)
        }

        if(results.length > 0) {
            return res.render('registro', {
                message_error: 'Email já está em uso'
            })
        } else if( password !== password2 ) {
            return res.render('registro', {
                message_error: 'Senhas não são iguais, tente novamente!'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8)
        console.log(hashedPassword)

        db.query('INSERT INTO users SET ?', {username: username, email: email, password: hashedPassword}, (error, results) => {
            if(error) {
                console.log(error)
            } else {
                console.log(results)
                return res.render('registro', {
                    message: 'Usuário registrado!'
                })
            }
        })
    })



    
}