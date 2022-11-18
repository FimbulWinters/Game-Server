const {
  selectCategories,
  selectReviews,
  selectReviewById,
  selectCommentsByReviewId,
  selectUsers,
  getAPIInfo,
} = require("../Models/getModels");

exports.getAPI = (req, res) => {
  getAPIInfo().then((contents) => {
    res.send({ contents });
  });
};

exports.getCategories = (req, res) => {
  selectCategories()
    .then((categories) => {
      res.send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getReviews = (req, res) => {
  selectReviews().then((reviews) => {
    res.send({ reviews });
  });
};
exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};
exports.getCommentsByReviewID = (req, res, next) => {
  const { review_id } = req.params;
  selectCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.send({ users });
    })
    .catch(next);
};
