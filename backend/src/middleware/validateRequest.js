const Joi = require('joi');

const chatSchema = Joi.object({
  sessionId: Joi.string().uuid().optional(),
  patientName: Joi.string().max(100).optional(),
  disease: Joi.string().min(2).max(200).required(),
  query: Joi.string().min(3).max(1000).required(),
  location: Joi.string().max(200).optional()
});

const validateChatRequest = (req, res, next) => {
  const { error } = chatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateChatRequest };
