const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/registro', (req, res) => {
    res.render('registro')
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

module.exports = router