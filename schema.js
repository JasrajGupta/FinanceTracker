const Joi = require("joi");

module.exports.transctionSchema = Joi.object({
    transction : Joi.object().required({
        amount: Joi.number().required().min(0),
       
        sourcetype:Joi.string().required(),
        date:Joi.number().required(),
        notes:Joi.string().required(),
          category: Joi.when("sourceType", {
      is: "expense",
      then: Joi.string()
        .valid(
          "Housing",
          "Food",
          "Transport",
          "Entertainment",
          "Health",
          "Shopping",
          "Others"
        )
        .required()
        .messages({
          "any.required": "Category is required for expense transactions"
        }),
      otherwise: Joi.string().optional().allow("", null)
    })

    }).required()
});