const request = require("supertest");
const app = require("../app.js");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  test("should return details of endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((contents) => {
        const information = JSON.parse(contents.text);

        for (endpoint in information.contents) {
          let key = endpoint;
          expect(information.contents[key]).toMatchObject({
            description: expect.any(String),
          });
        }
      });
  });
});

describe("bad paths", () => {
  test("GET 404 return 404 on invalid url", () => {
    return request(app)
      .get("/api/wrongURL")
      .expect(404)
      .then((result) => {
        expect(result.body.message).toBe("invalid url");
      });
  });
});

describe("GET api/categories", () => {
  test("return the categories ", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((result) => {
        expect(result.body.categories).toBeInstanceOf(Array);
        expect(result.body.categories.length).toBeGreaterThan(0);
        result.body.categories.forEach((category) => {
          expect(category).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            }),
          );
        });
      });
  });
});
describe("GET /api/reviews", () => {
  test("returns all the reviews", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.body.reviews).toBeInstanceOf(Array);
        expect(result.body.reviews.length).toBeGreaterThan(0);
        result.body.reviews.forEach((reviews) => {
          expect(reviews).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            review_body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  describe("queries", () => {
    test("categories", () => {
      return request(app)
        .get("/api/reviews?category=dexterity")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews.length).toBeGreaterThan(0);
          result.body.reviews.forEach((reviews) => {
            expect(reviews).toMatchObject({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              category: "dexterity",
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String),
            });
          });
        });
    });
    test("200 category exists but has no reviews associated", () => {
      return request(app)
        .get("/api/reviews?category=children's games")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toEqual([]);
        });
    });

    describe("sort_by", () => {
      test("shoudl default to created_at", () => {
        return request(app)
          .get("/api/reviews?")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeGreaterThan(0);
            expect(result.body.reviews[0]).toMatchObject({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: 7,
              category: expect.any(String),
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String),
            });
          });
      });
      test("sort_by", () => {
        return request(app)
          .get("/api/reviews?sort_by=owner")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeGreaterThan(0);
            expect(result.body.reviews[0]).toMatchObject({
              owner: "philippaclaire9",
              title: expect.any(String),
              review_id: 2,
              category: expect.any(String),
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String),
            });
          });
      });
    });
    describe("order", () => {
      test("default order", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeGreaterThan(0);
            expect(result.body.reviews).toBeSorted({ descending: true });
          });
      });
      test("should sort in ascending order", () => {
        return request(app)
          .get("/api/reviews?order=ASC")
          .expect(200)
          .then((result) => {
            expect(result.body.reviews.length).toBeGreaterThan(0);
            expect(result.body.reviews).toBeSortedBy("created_at");
          });
      });
    });
    describe("combination of sort and order", () => {
      test("query shoudl run when sort and order params are combined", () => {
        return request(app)
          .get("/api/reviews?sort_by=review_id&order=ASC")
          .expect(200)
          .then(({ body }) => {
            expect(body.reviews).toBeSortedBy("review_id");
          });
      });
    });
  });
  describe("errors", () => {
    describe("categories", () => {
      test("return 400 when category provided doesnt exist", () => {
        return request(app)
          .get("/api/reviews?category=aubergine")
          .expect(400)
          .then((result) => {
            expect(result.body.message).toBe("Category not found");
          });
      });
      // Not valid test not required as it will be stringified anyway, and thus will always be valid
    });
    describe("sort by", () => {
      test("400: sort by invalid column name", () => {
        return request(app)
          .get("/api/reviews?sort_by=aubergine")
          .expect(400)
          .then((result) => {
            expect(result.body.message).toBe("invalid query");
          });
      });
    });
    describe("400 order by", () => {
      test("400 order by anything by asc or desc", () => {
        return request(app)
          .get("/api/reviews?order=aubergine")
          .expect(400)
          .then((result) => {
            expect(result.body.message).toBe("invalid query");
          });
      });
    });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("should return all the reviews with a given id", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toBeInstanceOf(Array);
        expect(body.review.length).toBeGreaterThan(0);
        expect(body.review[0]).toEqual({
          review_id: 2,
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          owner: expect.any(String),
          comment_count: expect.any(String),
        });
      });
  });
  test("should return the review without comment count column where there are no comments", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toBeInstanceOf(Array);
        expect(body.review.length).toBeGreaterThan(0);
        expect(body.review[0]).toEqual({
          review_id: 1,
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          owner: expect.any(String),
        });
      });
  });

  describe("errors", () => {
    test("should return 404: review not found when provided an id that is valid but doesnt exist", () => {
      return request(app)
        .get("/api/reviews/1000000")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Review not found!");
        });
    });
    test("should return 400: bad request when given an invalid id", () => {
      return request(app)
        .get("/api/reviews/hello")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad request!");
        });
    });
  });
});

describe("Get /api/reviews/:review_id/comments", () => {
  describe("Happy path", () => {
    test("Should return comments relating to a given review", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toBeInstanceOf(Array);
          expect(body.comments.length).toBeGreaterThan(0);
          expect(body.comments[0]).toEqual({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: 2,
          });
        });
    });
    test("Should return empty array of comments when given a valid review id by there are no comments on that id ", () => {
      return request(app)
        .get("/api/reviews/10/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
  });
  describe("Sad Path", () => {
    test("Should return error 404 when given a valid but non-existent id", () => {
      return request(app)
        .get("/api/reviews/10000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Review not found");
        });
    });
    test("Should return error 400 when given an invalid id", () => {
      return request(app)
        .get("/api/reviews/sponge/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad request!");
        });
    });
  });
});

describe("GET /api/users", () => {
  describe("Happy path", () => {
    test("respond with all the users ", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users.length).toBeGreaterThan(0);
          body.users.forEach((user) => {
            expect(user).toEqual({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});
