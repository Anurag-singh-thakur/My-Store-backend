import mongoose from "mongoose";
import Product from "../model/product.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../model/user.js";
import Cart from "../model/cart.js";

const postProduct = async(req,res) => {
    try {
        // const {pname:name,pbio:description,pprice:price,pstock:stock} = req.body;
        const {name,description,price,stock} = req.body;
        const owner = req.user._id;

        let {pimage} = req.body;

        // if(pimage){
        //     const resUpload = await cloudinary.uploader.upload(pimage);
        //     pimage = resUpload.secure_url;
        // }
        if(pimage){
            for (let i = 0; i < pimage.length; i++) {
                const resUpload = await cloudinary.uploader.upload(pimage[i]);
                pimage[i] = resUpload.secure_url;
            }
        }
        // if (req.file) {
        //     if (pimage) {
        //         for (let i = 0; i < pimage.length; i++) {
        //             await cloudinary.uploader.destroy(user.ProfilePic.split("/").pop().split(".")[0]);
        //         }
        //     }
        //     const updateRes = await cloudinary.uploader.upload(req.file.path);
        //     profilePic = updateRes.secure_url;
        // }
        if(!name || !description || !price || !pimage || !stock){
            res.status(401).json({err:"all fields are required"})
        }

        const newProduct = new Product({
            owner,
            pname:name,
            pbio:description,
            pprice:price,
            pimage,
            pstock:stock
        })
        await newProduct.save();
        res.status(201).json({msg:"product added successfully"})
    } catch (err) {
        console.log(err)
        res.status(501).json({err:"internal server error"})
    }
}

const getAllProduct = async(req,res) => {
    try {
        const Allproduct = await Product.find();
        res.status(201).json(Allproduct)
    } catch (err) {
        console.log(err)
        res.status(501).json({err:"internal server error"})    
    }
}
const getSpecificProduct = async(req,res)=>{
    try {
        const pid = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }
        const getproduct = await Product.findById(pid);
        if(!getproduct){
            res.status(401).json({err:"product not found"})
        }
        res.status(201).json(getproduct )
    } catch (error) {
        console.log(error)
        res.status(501).json({err:"internal server error"})
    }
}
const cartRoute = async (req, res) => {
    
    const { _id: userId } = req.user; 
    const { quantity } = req.body;
    const { productId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        console.log("productId: ", productId);
        console.log("userId: ", userId);

        // Validate product ID and quantity
        if (!mongoose.Types.ObjectId.isValid(productId) || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product ID or quantity' });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (typeof product.pprice !== 'number' || isNaN(product.pprice)) {
            return res.status(400).json({ message: 'Invalid product price' });
        }

        // Find the user and populate the cart
        const user = await User.findById(userId).populate('cart');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let cart = user.cart;

        if (!cart) {
            cart = new Cart();
            user.cart = cart._id;
            await user.save();
        }
        console.log(product,"product");
        const cartItemIndex = cart.items.findIndex(item => item.product.equals(productId));

        const validQuantity = Number(quantity);  
        const itemPrice = validQuantity * product.pprice;  
        console.log("cartItemIndex: ", cartItemIndex,itemPrice,validQuantity);
        if (cartItemIndex > -1) {
            cart.items[cartItemIndex].quantity += validQuantity;
            cart.items[cartItemIndex].price = cart.items[cartItemIndex].quantity * product.price;
        } else {
            cart.items.push({
                product: productId,
                quantity: validQuantity,
                price: itemPrice
            });
        }

        cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

        cart.totalPrice = isNaN(cart.totalPrice) ? 0 : cart.totalPrice;
        cart.totalQuantity = isNaN(cart.totalQuantity) ? 0 : cart.totalQuantity;

        await cart.save();  

        res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const GetCart = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const user = await User.findById(userId).populate({
            path: 'cart.items.product',
            model: 'Product',
        });

        if (!user || !user.cart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }
        let CartId = user.cart;
        let cartProduct = await Cart.findById(CartId);
        res.status(200).json(cartProduct);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const deleteProductFromCart = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const user = await User.findById(userId).populate({
            path: 'cart.items.product',
            model: 'Product',
        });

        if (!user || !user.cart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }

        const cartId = user.cart;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ message: 'Invalid Cart ID' });
        }

        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productId = req.params.pId;
        console.log("productId: ", productId);

        if (!mongoose.Types.ObjectId.isValid(productId)) { 
            return res.status(400).json({ message: 'Invalid Product ID' });
        }
        

        const productIndex = cart.items.findIndex(item => item.product.equals(productId));
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        cart.items.splice(productIndex, 1);
        cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
        cart.totalPrice = isNaN(cart.totalPrice) ? 0 : cart.totalPrice;
        cart.totalQuantity = isNaN(cart.totalQuantity) ? 0 : cart.totalQuantity;
        await cart.save();

        res.status(200).json({ message: 'Product deleted from cart' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}
const GetUserProduct = async (req, res) => {
    try {
        console.log("working")
        const userId = req.params.UserId;
        console.log(userId)

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const userProduct = await Product.find({ owner: userId });

        if(!userProduct){
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export {postProduct,getAllProduct,cartRoute,getSpecificProduct,GetUserProduct,GetCart,deleteProductFromCart}