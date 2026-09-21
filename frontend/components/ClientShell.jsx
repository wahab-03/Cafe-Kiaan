"use client";
import {CartProvider} from "../context/CartContext";
export default function ClientShell({children}){ return <CartProvider>{children}</CartProvider>; }
