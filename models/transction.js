const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transctionSchema = new Schema ({
    amount: {
        type: Number,
        required: true,
    },  
    category:{
        type: String,
         enum: ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Others'],
         required: function () {
    return this.sourceType === 'expense';
  },
        validate: {
    validator: function (value) {
      // If it's income, there should be no category
      if (this.sourceType === 'income') {
        return !value; // value must be undefined, null, or empty
      }
      return true;
    },
    message: "Income transactions should not have a category."
  }
    }, 
    sourceType: {
        type: String,
        enum:["income", "expense"],
         required: true
    },
    date: {
        type:Date,
        required:true,
    },
    notes:{
       type:String,
       required:true,
    },
    owner: {
        type: Schema.Types.ObjectId, 
        ref: "User",
    },
})

// transctionSchema.post("findOneAndDelete", async(transction) ={

// })

const Transction = mongoose.model("Transction", transctionSchema);
module.exports = Transction;