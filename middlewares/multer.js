const multer = require("multer");

// -------image upload-------------//

let multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images/productImages");
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
  });
  
  let upload = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/webp") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(
            new Error('Only .png, .jpg and .jpeg format allowed!')
            );
        }
      }
  });

  let uploadImages = upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "extraImages", maxCount: 3 },
  ]);

  module.exports = {
    uploadImages
  };
  
  
  //-----------------xx------------------//
  
