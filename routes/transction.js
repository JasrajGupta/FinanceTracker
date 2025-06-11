const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const{transctionSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Transction = require("../models/transction.js");
const{isLoggedIn} = require("../middleware.js");

const validateTransction = (req, res, next) => {
  let {error} = transctionSchema.validate(req.body);
  if(error) {
    let errMsg = error.details?.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else{
    next();
  }
}


  // index Route
router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const selectedMonth = req.query.month || new Date().toISOString().slice(0, 7);

  const [year, month] = selectedMonth.split("-");
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);


// 🔹 For budget logic
const allMonthlyTrans = await Transction.find({
  owner: userId,
  date: {
    $gte: startDate,
    $lt: endDate,
  },
});

  // 🔹 For displaying only 5 most recent
  const alltransctions = await Transction.find({
    owner: userId,
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  })
   .sort({ date: -1 })
  .limit(5);

  // 🌟 All transactions (for the line chart)
  const fullYearTransactions = await Transction.find({ owner: userId });

  // Total income/expense for selected month
  let totalIncome = 0;
  let totalExpense = 0;

  allMonthlyTrans.forEach((tx) => {
    if (tx.sourceType === "income") {
      totalIncome += tx.amount;
    } else if (tx.sourceType === "expense") {
      totalExpense += tx.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  // 🌟 Monthly income/expense arrays for the whole year
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  fullYearTransactions.forEach((tx) => {
    const txMonth = new Date(tx.date).getMonth(); // 0 = Jan
    if (tx.sourceType === "income") {
      monthlyIncome[txMonth] += tx.amount;
    } else if (tx.sourceType === "expense") {
      monthlyExpense[txMonth] += tx.amount;
    }
  });

  res.render("transctions/index", {
    alltransctions,
    totalIncome,
    totalExpense,
    balance,
    selectedMonth,
    monthlyIncome,
    monthlyExpense,
  });
});



//calculatorRoute
router.get("/calculator",isLoggedIn, async(req, res) => {
  res.render("transctions/calculator.ejs");
})

 //recent Route
 router.get("/recent",isLoggedIn,async (req,res) => {
  const userId = req.user._id;
 const alltransctions = await Transction.find({owner: userId}).sort({ date: -1 })
 .skip(5);
 res.render("transctions/recent.ejs",{alltransctions});
   ;
  })
//search ROute
router.get("/search", async (req, res) => {
  const { q } = req.query;
const userId = req.user._id;
  try {
    const searchCriteria = [];

    // If query is a number → search in amount
    if (!isNaN(Number(q))) {
      searchCriteria.push({ amount: Number(q) });
    }

    // Always search in category
    searchCriteria.push(
      { category: { $regex: q, $options: "i" } }
    );

    const transctions = await Transction.find({
      owner: userId,
      $or: searchCriteria,
    })
      .sort({ date: -1 }) // optional
      .limit(10); // optional

    res.json(transctions);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed", error: err.message || err });
  }
});

  //new Route
  router.get("/new",isLoggedIn, async(req, res) => {
    res.render("transctions/new.ejs");
  })

   //show Route
  router.get("/:id", async(req,res) => {
    let {id} = req.params;
    const transction = await Transction.findById(id).populate("owner");
    if(!transction) {
        req.flash("error", " Warning: transction Does not exist!");
       return res.redirect("/transctions");
      
    }
    res.render("transctions/show.ejs",{transction});

  });
  
//create Route 
router.post("/",validateTransction,wrapAsync( async(req, res, next) => {
  const newTransction = new Transction(req.body.transction);
  newTransction.owner = req.user._id;
  await newTransction.save();
  req.flash("success", "New Transction Added");
  res.redirect("/transctions")
 }))


 //edit Route
router.get("/:id/edit",isLoggedIn, async (req, res)=> {
   let {id} = req.params;
   const transction = await Transction.findById(id);
   if(!transction) {
        req.flash("error", " Warning: transction Does not exist!");
       return res.redirect("/transctions");
      
    }
   res.render("transctions/edit.ejs",{transction})
})
//sourceType Route 
router.get("/sourceType/:sourceTypeName",isLoggedIn ,async (req, res) => {
  
  // if (req.session.user_id) {
  //   currentUser = await User.findById(req.session.user_id);
  // }
   const userId = req.user._id;
  const { sourceTypeName } = req.params;
   
  const alltransctions = await Transction.find({owner: userId , sourceType: sourceTypeName});


  res.render("transctions/recent.ejs", {alltransctions , sourceTypeName});
  req.flash("success", `You are viewing: ${sourceTypeName.charAt(0).toUpperCase() +sourceTypeName.slice(1)}`);
  
});


//update Route
router.put("/:id",validateTransction, isLoggedIn,async (req, res) => {
     let {id} = req.params;
    await Transction.findByIdAndUpdate(id,{...req.body.transction});
     req.flash("success", "Transction Updated");
    res.redirect(`/transctions/${id}`)
})
//delete ROute
router.delete("/:id",isLoggedIn, async(req, res) => {
  let {id }  = req. params;
  let deletedTransction =  await Transction.findByIdAndDelete(id)
  console.log(deletedTransction);
   req.flash("success", "Transction Deleted");
  res.redirect("/transctions")
})

module.exports = router;