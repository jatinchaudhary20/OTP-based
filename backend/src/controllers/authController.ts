    import { Request, Response } from "express";
    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";    
    import { pool } from "../db/database";

    export const register = async (req: Request, res: Response) => {
        try {
            const { email, firstname, lastname} = req.body;

            if(!email || !firstname || !lastname){
                return res.status(400).json({
                    message: "Email, first name and last name are required"
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)){
                return res.status(400).json({
                    message: "Invalid email format"
                });
            }

            const existingUser = await pool.query(
                "SELECT id FROM users WHERE email = $1",
                [email.toLowerCase()]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }
        // math.floor will round down the number to the nearest integer, and math.random will generate a random number between 0 and 1. By multiplying it by 900000 and adding 100000, we ensure that the result is a 6-digit number. Finally, we convert it to a string using toString() method.
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
            const otpHash = await bcrypt.hash(otp,10);
            const result = await pool.query(
            "INSERT INTO users (email, first_name, last_name, otp_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name",
            [email.toLowerCase(), firstname, lastname, otpHash]
            );
            return res.status(201).json({
            message: "User registered successfully",
            otp,
            user: result.rows[0]
            });
        } catch (error) {
            console.error("Error during registration:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    };
    export const recognizeUser = async (
        req: Request,
        res: Response
    ) => {
        try {
            const email = req.query.email as string;
            if (!email) {
                return res.status(400).json({
                    message: "Email is required"
                });
            }
            const result = await pool.query(
                'SELECT id, first_name, last_name FROM users WHERE email = $1',
                [email.toLowerCase()]
            );
            if (result.rows.length === 0) {
                return res.json({
                    registered: false
                });
            }
            return res.json({
                registered: true,
                user: {
                    id: result.rows[0].id,
                    firstname: result.rows[0].first_name,
                    lastname: result.rows[0].last_name
                }
            });
        }catch (error) {
            console.error("Error during user recognition:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    };
    export const login = async (req: Request, res: Response) => {
        try {
            const { email, otp } = req.body;
            if(!email || !otp){
                return res.status(400).json({
                    message: "Email and OTP are required"
                });
            }
            const result = await pool.query(
                'SELECT id, email, first_name, last_name, otp_hash FROM users WHERE email = $1',
                [email.toLowerCase()]
            );
            if(result.rows.length === 0){
                return res.status(401).json({
                    message: "Invalid email or OTP"
                });
            }

            const user = result.rows[0];
            const isValidOtp = await bcrypt.compare(otp, user.otp_hash);
            if(!isValidOtp){
                return res.status(401).json({
                    message: "Invalid OTP"
                });
            }
            const secret = process.env.JWT_SECRET ;
            if(!secret){
                throw new Error("JWT_SECRET is not defined in environment variables");
            }
            const token = jwt.sign(
                { 
                    userId: user.id,
                    email: user.email},
                    secret,
                    {
                        expiresIn: "1h"
                    }
            );
            return res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.first_name,
                    lastname: user.last_name
                    }
                });
        }  catch (error) {
            console.error("login Error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    };