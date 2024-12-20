import mongoose from "mongoose"

const productSchema  = mongoose.Schema({
    pname:{
        type:String,
        require:true
    },
    pbio:{
        type:String
    },
    pprice:{
        type:Number,
        require:true
    },
    pimage:[{
        type:String,
        require:true
    }],
    // pcategory:{
    //     type:String,
    //     enum:["men","women","kids","electronics","accessories"],
    //     require:true
    // },
    pstock:{
        type:Number,
        require:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{
    Timestamp:true
})

export default mongoose.model("Product",productSchema)