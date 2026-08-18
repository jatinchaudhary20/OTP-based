import { Request, Response } from "express";
import { pool } from "../db/database";

export const createCheckout = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      phone,
      shippingAddress,
    } = req.body;

    if (!email || !phone || !shippingAddress) {
      return res.status(400).json({
        message:
          "Email, phone number and shipping address are required",
      });
    }
    const result = await pool.query(
      `INSERT INTO checkout_orders
        (email, phone, shipping_address)
       VALUES ($1, $2, $3)
       RETURNING id, email, phone, shipping_address, created_at`,
      [
        email.toLowerCase(),
        phone,
        shippingAddress,
      ]
    );

    return res.status(201).json({
      message: "Checkout submitted successfully",
      order: result.rows[0],
    });

  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      message: "Failed to submit checkout",
    });
  }
};