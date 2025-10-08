// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
// const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");
// const listingController = require("../controllers/listings.js");
// const multer=require('multer');
// const {storage}=require("../cloudConfig.js");
// const upload=multer({storage});

// router
// .route("/")
// .get(wrapAsync(listingController.index))
// .post(
//   isLoggedIn,
//   upload.single("listing[image]"),
//   validateListing,
//   wrapAsync(listingController.createListing)
// );


// // New
// router.get("/new",isLoggedIn, listingController.renderNewForm);

// router.route("/:id")
// .get(
//   wrapAsync(listingController.showListing))
// .put(
//   isLoggedIn,
//   isOwner,
//   upload.single("listing[image]"),
//   validateListing,
//   wrapAsync(listingController.updateListing))
// .delete(
//   isLoggedIn,isOwner,
//   wrapAsync(listingController.destroy)
// );

// // ------------------ Routes ------------------
// // Edit
// router.get(
//   "/:id/edit",
//   isLoggedIn,isOwner,
//   wrapAsync(listingController.renderEditForm)
// );

// module.exports = router;
const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");
const { isLoggedIn } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
  .get(listings.index)
  .post(isLoggedIn, upload.single("listing[image]"), listings.createListing);

router.get("/new", isLoggedIn, listings.renderNewForm);

router.route("/:id")
  .get(listings.showListing)
  .put(isLoggedIn, upload.single("listing[image]"), listings.updateListing)
  .delete(isLoggedIn, listings.destroy);

router.get("/:id/edit", isLoggedIn, listings.renderEditForm);


module.exports = router;
