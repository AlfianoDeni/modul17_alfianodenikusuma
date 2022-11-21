const express = require('express')
const db = require('../db.config/db.config')
const jwt = require('jsonwebtoken');
// const Auth = require('./auth')
const cookieParser = require('cookie-parser');
require("dotenv").config();
const bcrypt = require('bcrypt');
SECRET = process.env.SECRET


const register = async (req, res, next) => {
    const { username, email, password } = req.body
    // * 7. silahkan ubah password yang telah diterima menjadi dalam bentuk hashing
    const hash = await bcrypt.hash(password, 10)

    // 8. Silahkan coding agar pengguna bisa menyimpan semua data yang diinputkan ke dalam database

    try {
        await db.query(`INSERT INTO unhan_modul_17 VALUES(DEFAULT, $1, $2, $3)`, [username, email, hash])
        res.send('input data sukses')
    } catch (err) {
        return res.send('input tidak berhasil')
    }
}

const login = async (req, res, next) => {
    const { username, password } = req.body
    const user = await db.query(`SELECT * FROM unhan_modul_17 WHERE username = $1`, [username])
    // 9. komparasi antara password yang diinput oleh pengguna dan password yang ada didatabase
    try {
        await bcrypt.compare(password, user.rows[0].password, (err, result) => {
            if (err) {
                res.send(err)
            }
            if (!result) {
                return res.send("Password atau Username salah")
            } else {
                const data ={
                    id: user.rows[0].id,
                    username: user.rows[0].username,
                    email: user.rows[0].email,
                    password: user.rows[0].password
                }
                // 10. Generate token menggunakan jwt sign
                token = jwt.sign(data, process.env.SECRET)
                //11. kembalikan nilai id, email, dan username
                res.cookie("JWT", token, {httpOnly: true, sameSite: "strict"}).status(200).json({
                    message : "Login Berhasil",
                    id: data.id,
                    username: data.username,
                    email: data.email})
            }
        })
    } catch(error){
        res.status(500).send(error)
    }
}

const logout = async (req, res, next) => {

    try {
        // 14. code untuk menghilangkan token dari cookies dan mengembalikan pesan "sudah keluar dari aplikasi" 
        return res.clearCookie('JWT').send('Logout Berhasil')
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }

}

const verify = async (req, res, next) => {
    try {
        // 13. membuat verify
        const {username} = req.body
        const user = await db.query(`SELECT * FROm unhan_modul_17 where username=$1`, [username])
        return res.status(200).json({
            id: user.rows[0].id,
            username: user.rows[0].username,
            email: user.rows[0].email,
            password: user.rows[0].password
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
}

module.exports = {
    register,
    login,
    logout,
    verify
}