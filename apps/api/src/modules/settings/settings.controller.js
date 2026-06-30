const { Settings } = require('../../models');
const { z } = require('zod');

const billingSchema = z.object({
  deliveryFee: z.coerce.number().min(0).optional(),
  packingFee: z.coerce.number().min(0).optional(),
  charges: z.array(z.object({ label: z.string(), amount: z.coerce.number() })).optional(),
});

module.exports = {
  billingSchema,
  getBilling: async (req, res) => {
    const doc = await Settings.findOne({ key: 'global' }).lean();
    res.json({ billing: (doc && doc.billing) || { deliveryFee: 0, packingFee: 0, charges: [] } });
  },
  updateBilling: async (req, res) => {
    const doc = await Settings.findOneAndUpdate({ key: 'global' }, { $set: { billing: req.body } }, { upsert: true, new: true });
    res.json({ billing: doc.billing });
  },
};
