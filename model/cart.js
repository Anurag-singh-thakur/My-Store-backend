import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: Number,
            required: true,
            validate: {
              validator: function(value) {
                return !isNaN(value);
              },
              message: props => `${props.value} is not a valid price!`
            }
          }
    }],
    totalQuantity: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
}, { timestamps: true });


export default mongoose.model("Cart", cartSchema);
