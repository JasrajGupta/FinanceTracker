const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Budget = require('../models/budget'); // your Mongoose model
const { isLoggedIn } = require('../middleware.js'); // optional auth middleware
const Transaction = require("../models/transction.js");

// 📌 GET: Dashboard View (index.ejs)
router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [year, month] = currentMonth.split("-");
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const budget = await Budget.findOne({ user: userId, month: currentMonth });

  // 🌟 Monthly transactions for budget calculations
  const monthlyTransactions = await Transaction.find({
    owner: userId,
    date: { $gte: startDate, $lt: endDate },
  });

  // 🌟 5 most recent EXPENSES for recent expense box
  const recentTransactions = await Transaction.find({
    owner: userId,
    sourceType: "expense",
  })
    .sort({ date: -1 })
    .limit(5);

  // 🌟 Actual spending logic
  let actualSpending = {
    Housing: 0, Food: 0, Transport: 0, Entertainment: 0,
    Health: 0, Shopping: 0, Others: 0,
  };

  let totalSpent = 0;
  for (let tx of monthlyTransactions) {
    if (actualSpending[tx.category] !== undefined) {
      actualSpending[tx.category] += tx.amount;
      totalSpent += tx.amount;
    }
  }

  const budgetCategories = budget ? budget.categories : actualSpending;
  const totalBudget = Object.values(budgetCategories).reduce((a, b) => a + b, 0);
  const progressPercent = totalBudget ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  res.render("budget/index.ejs", {
    balance: totalBudget - totalSpent,
    chartLabels: Object.keys(budgetCategories),
    chartBudgetData: Object.values(budgetCategories),
    chartActualData: Object.values(actualSpending),
    budget,
    totalBudget,
    totalSpent,
    progressPercent,
    recentTransactions, // only recent EXPENSES
  });
});


// 📌 GET: New Budget Form (new.ejs)
router.get("/new", isLoggedIn, (req, res) => {
  res.render("budget/new.ejs");
});


// 📌 POST: Create Budget
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
  const { month, categories } = req.body;

  const existing = await Budget.findOne({ owner: req.user._id, month });
  if (existing) {
    req.flash("error", "Budget already exists for this month");
    return res.redirect(`/budget/${existing._id}/edit`);
}

  const budget = new Budget({
    user: req.user._id,
    month,
    categories
  });

  await budget.save();
  req.flash("success", "Budget created successfully");
  res.redirect("/budget");
}));


// 📌 GET: Edit Budget Form (edit.ejs)
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget || !budget.user.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this budget");
    return res.redirect("/budget");
  }
  res.render("budget/edit", { budget });
});


// 📌 PUT: Update Budget
router.put("/:id", isLoggedIn, async (req, res) => {
  const { categories } = req.body;
  const budget = await Budget.findById(req.params.id);

  if (!budget || !budget.user.equals(req.user._id)) {
    req.flash("error", "Unauthorized update attempt");
    return res.redirect("/budget");
  }

  budget.categories = categories;
  await budget.save();

  req.flash("success", "Budget updated");
  res.redirect("/budget");
});

module.exports = router;
