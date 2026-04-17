const Joi = require('joi');

const chatSchema = Joi.object({
  sessionId: Joi.string().uuid().optional(),
  patientName: Joi.string().max(100).optional(),
  disease: Joi.string().min(2).max(200).required(),
  query: Joi.string().min(3).max(1000).required(),
  location: Joi.string().max(200).optional()
});

const validateChatRequest = (req, res, next) => {
  const normalizedBody = {
    ...req.body,
    sessionId: req.body?.sessionId || undefined,
    patientName: typeof req.body?.patientName === 'string' ? req.body.patientName.trim() || undefined : req.body?.patientName,
    disease: typeof req.body?.disease === 'string' ? req.body.disease.trim() : req.body?.disease,
    query: typeof req.body?.query === 'string' ? req.body.query.trim() : req.body?.query,
    location: typeof req.body?.location === 'string' ? req.body.location.trim() || undefined : req.body?.location
  };

  const { error, value } = chatSchema.validate(normalizedBody, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  req.body = value;
  next();
};

module.exports = { validateChatRequest };
