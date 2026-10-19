const express = require('express');
const { body, validationResult } = require('express-validator');
const Spot = require('../models/Spot');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const categories = ['Nature', 'Historical', 'Beach', 'Religious', 'Adventure', 'City & Culture', 'Other'];
const sampleImages = {
  Nature: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  Historical: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  Beach: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  Religious: 'https://images.unsplash.com/photo-1606293926075-69a00db9654b?auto=format&fit=crop&w=1200&q=80',
  Adventure: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'City & Culture': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
  Other: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
};

router.get('/', async (req, res, next) => {
  try {
    const { q = '', category = '', sort = 'newest' } = req.query;
    const filter = {};
    if (category && categories.includes(category)) filter.category = category;
    if (q.trim()) filter.$or = [
      { name: { $regex: q.trim(), $options: 'i' } }, { city: { $regex: q.trim(), $options: 'i' } },
      { state: { $regex: q.trim(), $options: 'i' } }, { description: { $regex: q.trim(), $options: 'i' } }
    ];
    let spots = await Spot.find(filter).populate('createdBy', 'name').lean({ virtuals: true });
    spots = spots.map(spot => ({ ...spot, averageRating: spot.reviews.length ? spot.reviews.reduce((sum, r) => sum + r.rating, 0) / spot.reviews.length : 0 }));
    if (sort === 'rating') spots.sort((a, b) => b.averageRating - a.averageRating);
    else if (sort === 'name') spots.sort((a, b) => a.name.localeCompare(b.name));
    else spots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render('spots/index', { title: 'Explore destinations', spots, categories, filters: { q, category, sort } });
  } catch (error) { next(error); }
});

router.get('/new', requireAuth, (req, res) => res.render('spots/new', { title: 'Add a destination', categories, errors: [] }));
router.post('/', requireAuth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Enter a spot name.'),
  body('city').trim().notEmpty().withMessage('Enter a city or town.'),
  body('state').trim().notEmpty().withMessage('Enter a state or region.'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters.')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render('spots/new', { title: 'Add a destination', categories, errors: errors.array() });
  try {
    const category = categories.includes(req.body.category) ? req.body.category : 'Other';
    const imageUrl = (req.body.imageUrl || '').trim() || sampleImages[category];
    const spot = await Spot.create({
      name: req.body.name, city: req.body.city, state: req.body.state, category,
      description: req.body.description, imageUrl,
      bestTime: (req.body.bestTime || '').trim() || 'Check local weather before visiting',
      entryFee: (req.body.entryFee || '').trim() || 'Check locally', createdBy: req.session.user.id
    });
    req.session.flash = { type: 'success', message: 'Destination added successfully.' };
    res.redirect(`/spots/${spot._id}`);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const spot = await Spot.findById(req.params.id).populate('createdBy', 'name').populate('reviews.user', 'name');
    if (!spot) return res.status(404).render('404', { title: 'Destination not found' });
    const reviews = [...spot.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render('spots/show', { title: spot.name, spot, reviews });
  } catch (error) { next(error); }
});

router.post('/:id/reviews', requireAuth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Choose a rating from 1 to 5.'),
  body('comment').trim().isLength({ min: 5, max: 1000 }).withMessage('Review must be 5–1000 characters.')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.flash = { type: 'error', message: errors.array()[0].msg };
    return res.redirect(`/spots/${req.params.id}`);
  }
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).render('404', { title: 'Destination not found' });
    const existing = spot.reviews.find(review => review.user.toString() === req.session.user.id);
    if (existing) {
      req.session.flash = { type: 'info', message: 'You have already reviewed this destination.' };
      return res.redirect(`/spots/${spot._id}`);
    }
    spot.reviews.push({ user: req.session.user.id, userName: req.session.user.name, rating: Number(req.body.rating), comment: req.body.comment });
    await spot.save();
    req.session.flash = { type: 'success', message: 'Thanks for sharing your review!' };
    res.redirect(`/spots/${spot._id}`);
  } catch (error) { next(error); }
});

router.delete('/:id/reviews/:reviewId', requireAuth, async (req, res, next) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).render('404', { title: 'Destination not found' });
    const review = spot.reviews.id(req.params.reviewId);
    if (!review) return res.redirect(`/spots/${spot._id}`);
    if (review.user.toString() !== req.session.user.id) {
      req.session.flash = { type: 'error', message: 'You can delete only your own review.' };
      return res.redirect(`/spots/${spot._id}`);
    }
    review.deleteOne(); await spot.save();
    req.session.flash = { type: 'success', message: 'Your review was deleted.' };
    res.redirect(`/spots/${spot._id}`);
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).render('404', { title: 'Destination not found' });
    if (spot.createdBy.toString() !== req.session.user.id) {
      req.session.flash = { type: 'error', message: 'Only the person who added this destination can delete it.' };
      return res.redirect(`/spots/${spot._id}`);
    }
    await spot.deleteOne();
    req.session.flash = { type: 'success', message: 'Destination deleted.' };
    res.redirect('/spots');
  } catch (error) { next(error); }
});
module.exports = router;
