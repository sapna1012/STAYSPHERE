const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");

// INDEX
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// NEW
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// CREATE
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  if (req.file) {
    newListing.image = {
      url: req.file.path,       // Cloudinary URL
      filename: req.file.filename // Cloudinary public ID
    };
  }

  newListing.owner = req.user._id;
  await newListing.save();

  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};

// SHOW
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// EDIT
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  // Thumbnail version from Cloudinary
  let originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/h_300,w_250"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    // delete old image from cloudinary
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    // upload new one
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destroy = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing && listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};

// controllers/listings.js
module.exports.index = async (req, res) => {
  const { category, search } = req.query;

  let query = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    // Search by title or location (case-insensitive)
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } }
    ];
  }

  const allListings = await Listing.find(query);
  res.render("listings/index.ejs", { allListings, category, search });
};

