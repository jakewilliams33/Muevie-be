const app = require("../app");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("Users", () => {
  describe("/api/users", () => {
    describe("GET", () => {
      test("Responds with an array of user objects", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then((res) => {
            expect(Array.isArray(res.body.users)).toBe(true);
            expect(res.body.users.length > 1).toBe(true);
            res.body.users.forEach((user) => {
              expect(user).toEqual({
                username: expect.any(String),
                profile_pic: expect.any(String),
                user_id: expect.any(Number),
                email: expect.any(String),
                created_at: expect.any(String),
                name: expect.any(String),
              });
            });
          });
      });
    });
  });

  describe("/api/users/:user_id", () => {
    describe("GET", () => {
      test("200: Responds with specified user", () => {
        return request(app)
          .get("/api/users/1")
          .expect(200)
          .then((res) => {
            expect(res.body.user).toEqual({
              username: "KeanuIsTheBest",
              name: "bill jenkins",
              email: "bill123@live.com",
              profile_pic: expect.any(String),
              created_at: expect.any(String),
              user_id: 1,
              followers: 5,
              following: 4,
            });
          });
      });
      test("404: user not found", () => {
        return request(app)
          .get("/api/users/3000")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("User Not Found");
          });
      });
    });
    describe("PATCH", () => {
      test("200: changes user info and returns updated user object", () => {
        const updates = {
          username: "jimothy",
          name: "owen wilson",
          email: "jake@live.com",
          profile_pic: "mooo",
        };
        return request(app)
          .patch("/api/users/1")
          .send(updates)
          .expect(200)
          .then((res) => {
            expect(res.body.user).toEqual(
              expect.objectContaining({
                username: "jimothy",
                name: "owen wilson",
                email: "jake@live.com",
                profile_pic: "mooo",
              })
            );
          });
      });
      test("200: works when passed single parameters", () => {
        const updates = {
          username: "jimothy",
        };
        return request(app)
          .patch("/api/users/1")
          .send(updates)
          .expect(200)
          .then((res) => {
            expect(res.body.user).toEqual(
              expect.objectContaining({
                username: "jimothy",
              })
            );
          });
      });
      test("404: user not found", () => {
        const updates = {
          username: "jimothy",
          name: "owen wilson",
          email: "jake@live.com",
          profile_pic: "mooo",
        };
        return request(app)
          .patch("/api/users/76534")
          .send(updates)
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("User Not Found");
          });
      });
    });
    describe("DELETE", () => {
      test("204: deletes user", () => {
        return request(app).delete("/api/users/1").expect(204);
      });
      test("404: error when user does not exist", () => {
        return request(app)
          .delete("/api/users/1242424")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("User Not Found");
          });
      });
    });
  });
});

describe("Register/Login", () => {
  describe("/api/register", () => {
    describe("POST", () => {
      test("201: Creates new user", () => {
        const newUser = {
          username: "blablabla",
          name: "jake williams",
          email: "test@test.test",
          profile_pic: expect.any(String),
          password: "password",
        };
        return request(app)
          .post("/api/register")
          .send(newUser)
          .expect(201)
          .then((res) => {
            expect(res.body.user).toEqual({
              username: newUser.username,
              user_id: expect.any(Number),
              name: newUser.name,
              email: newUser.email,
              created_at: expect.any(String),
              profile_pic: expect.any(String),
            });
          });
      });
      test("Ignores other keys", () => {
        const newUser = {
          username: "blablabla",
          name: "jake williams",
          email: "test@test.test",
          profile_pic:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          cat: "cat",
          isduibas: 656546,
          password: "blass",
        };
        return request(app)
          .post("/api/register")
          .send(newUser)
          .expect(201)
          .then((res) => {
            expect(res.body.user).toEqual({
              username: newUser.username,
              user_id: expect.any(Number),
              name: newUser.name,
              email: newUser.email,
              created_at: expect.any(String),
              profile_pic: expect.any(String),
            });
          });
      });
      test("400: bad request when missing required keys", () => {
        const newUser = {
          username: "blablabla",
          password: "password",
        };
        return request(app)
          .post("/api/register")
          .send(newUser)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("missing required fields");
          });
      });
      test("bad request when username already exists", () => {
        const newUser = {
          username: "benny_andthejets",
          name: "jake williams",
          email: "test@test.test",
          profile_pic: "bajnjs",
          password: "password",
        };
        return request(app)
          .post("/api/register")
          .send(newUser)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("username taken");
          });
      });
    });
  });
  describe("/api/login", () => {
    describe("POST", () => {
      test("200: verifies user password when passwords match", () => {
        const userPass = { username: "benny_andthejets", password: "password" };
        return request(app)
          .post("/api/login")
          .send(userPass)
          .expect(200)
          .then((res) => {
            expect(res.body).toEqual({
              msg: "User Logged In",
              verified: true,
              user: {
                username: "benny_andthejets",
                user_id: 2,
                name: "jimathanny elton",
                email: "ben123@live.com",
                profile_pic:
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                created_at: expect.any(String),
              },
            });
          });
      });
      test("200: passwords don't match", () => {
        const userPass = {
          username: "benny_andthejets",
          password: "password123",
        };
        return request(app)
          .post("/api/login")
          .send(userPass)
          .expect(200)
          .then((res) => {
            expect(res.body).toEqual({
              verified: false,
              msg: "Password Incorrect",
            });
          });
      });
    });
  });
  describe("/api/checkusername", () => {
    describe("GET", () => {
      test("returns true if username is free", () => {
        return request(app)
          .post("/api/checkusername")
          .send({ username: "usernameee" })
          .expect(200)
          .then((res) => {
            expect(res.body.usernameFree).toBe(true);
          });
      });
      test("returns false if username is taken", () => {
        return request(app)
          .post("/api/checkusername")
          .send({ username: "benny_andthejets" })
          .expect(200)
          .then((res) => {
            expect(res.body.usernameFree).toBe(false);
          });
      });
    });
  });
});

describe("Favourites", () => {
  describe("/api/users/:user_id/favourites", () => {
    describe("POST", () => {
      test("201: adds a new favourite", () => {
        const newFav = {
          movie_id: "tt0109248",
          movie_poster: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
          movie_title: "Watever",
        };
        return request(app)
          .post("/api/users/2/favourites")
          .send(newFav)
          .expect(201)
          .then((res) => {
            expect(res.body.favourite).toEqual({
              movie_id: "tt0109248",
              user_id: 2,
              favourite_id: expect.any(Number),
              movie_poster: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
              movie_title: "Watever",
              created_at: expect.any(String),
            });
          });
      });
      test("400: error message when missing info", () => {
        return request(app)
          .post("/api/users/2/favourites")
          .send({
            movie_poster: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
            movie_title: "Watever",
          })
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("missing required fields");
          });
      });
      test("404: error when user does not exist", () => {
        const newFav = {
          movie_id: "tt0109248",
          movie_poster: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
          movie_title: "Watever",
        };
        return request(app)
          .post("/api/users/1242424/favourites")
          .send(newFav)
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("User Not Found");
          });
      });
    });
    describe("GET", () => {
      test("200: responds with array of favourites for specified user", () => {
        return request(app)
          .get("/api/users/1/favourites")
          .expect(200)
          .then((res) => {
            res.body.favourites.forEach((fav) => {
              expect(fav).toEqual({
                movie_id: expect.any(String),
                user_id: 1,
                favourite_id: expect.any(Number),
                movie_poster: expect.any(String),
                movie_title: expect.any(String),
                created_at: expect.any(String),
              });
            });
          });
      });
      test("404: error when user does not exist", () => {
        return request(app)
          .get("/api/users/98798/favourites")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("User Not Found");
          });
      });
    });
  });

  describe("/api/users/:user_id/favourites?queries", () => {
    describe("GET", () => {
      test("200: responds with favourites sorted in specified order", () => {
        return request(app)
          .get("/api/users/1/favourites?order=ASC")
          .expect(200)
          .then((res) => {
            expect(res.body.favourites).toBeSortedBy("created_at", {
              ascending: true,
            });
          });
      });
      test("400: error invalid order", () => {
        return request(app)
          .get("/api/users/1/favourites?order=balls")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid order query");
          });
      });
    });
  });

  describe("/api/favourites/:favourite_id", () => {
    describe("DELETE", () => {
      test("204: deletes favourite", () => {
        return request(app).delete("/api/favourites/1").expect(204);
      });
      test("404: error when favourite does not exist", () => {
        return request(app)
          .delete("/api/favourites/1242424")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("Favourite Not Found");
          });
      });
    });
  });
});

describe("Posts", () => {
  describe("/api/posts", () => {
    describe("GET", () => {
      test("200: returns array of post objects", () => {
        return request(app)
          .get("/api/posts?limit=10&page=1")
          .expect(200)
          .then((res) => {
            expect(res.body.posts.length).toBe(7);
            expect(Array.isArray(res.body.posts)).toBe(true);
            res.body.posts.forEach((post) => {
              expect(post).toEqual({
                author: expect.any(String),
                body: expect.any(String),
                movie_title: expect.any(String),
                user_id: expect.any(Number),
                movie_id: expect.any(String),
                released: expect.any(String),
                created_at: expect.any(String),
                movie_poster: expect.any(String),
                likes: expect.any(Number),
                post_id: expect.any(Number),
                comment_count: expect.any(Number),
                profile_pic: expect.any(String),
                rating: expect.any(Number),
                media_type: "movie",
              });
            });
          });
      });
      test("200: returns array of posts limited by specified number", () => {
        return request(app)
          .get("/api/posts?limit=2&page=1")
          .expect(200)
          .then((res) => {
            expect(res.body.posts.length).toBe(2);
          });
      });
      test("200: returns array of post objects filtered by genre", () => {
        return request(app)
          .get("/api/posts?limit=10&page=1&genre=action")
          .expect(200)
          .then((res) => {
            expect(res.body.posts.length).toBe(3);
            expect(Array.isArray(res.body.posts)).toBe(true);
            res.body.posts.forEach((post) => {
              expect(post).toEqual({
                author: expect.any(String),
                body: expect.any(String),
                movie_title: expect.any(String),
                user_id: expect.any(Number),
                movie_id: expect.any(String),
                released: expect.any(String),
                created_at: expect.any(String),
                movie_poster: expect.any(String),
                likes: expect.any(Number),
                post_id: expect.any(Number),
                comment_count: expect.any(Number),
                profile_pic: expect.any(String),
                rating: expect.any(Number),
                media_type: "movie",
              });
            });
          });
      });
      test("200: returns array of post objects filtered by followers", () => {
        return request(app)
          .get("/api/posts?page=1")
          .send({ user_id: 6 })
          .expect(200)
          .then((res) => {
            expect(res.body.posts.length).toBe(3);
            expect(Array.isArray(res.body.posts)).toBe(true);
            res.body.posts.forEach((post) => {
              expect(post).toEqual({
                author: expect.any(String),
                body: expect.any(String),
                movie_title: expect.any(String),
                user_id: expect.any(Number),
                movie_id: expect.any(String),
                released: expect.any(String),
                created_at: expect.any(String),
                movie_poster: expect.any(String),
                likes: expect.any(Number),
                post_id: expect.any(Number),
                comment_count: expect.any(Number),
                profile_pic: expect.any(String),
                rating: expect.any(Number),
                media_type: "movie",
              });
            });
          });
      });
      test("400: invalid limit", () => {
        return request(app)
          .get("/api/posts?limit=tit&page=1")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid limit");
          });
      });
      test("400: invalid limit", () => {
        return request(app)
          .get("/api/posts?limit=1000&page=1")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid limit");
          });
      });
      test("400: invalid genre", () => {
        return request(app)
          .get("/api/posts?genre=cats")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid genre");
          });
      });
      test("400: no posts under genre yet", () => {
        return request(app)
          .get("/api/posts?genre=sport")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("No posts under that genre yet!");
          });
      });
    });

    describe("POST", () => {
      test("200: adds a new post and responds with new post object", () => {
        const newPost = {
          author: "cat_man",
          user_id: 4,
          movie_title: "Elf",
          movie_id: "tt0319343",
          movie_poster:
            "https://m.media-amazon.com/images/M/MV5BMzUxNzkzMzQtYjIxZC00NzU0LThkYTQtZjNhNTljMTA1MDA1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
          body: "the best film ever made",
          released: "07 Nov 2003",
        };
        const fakeUser = {
          author: "cat_man",
          user_id: 4324234,
          movie_title: "Elf",
          movie_id: "tt0319343",
          movie_poster:
            "https://m.media-amazon.com/images/M/MV5BMzUxNzkzMzQtYjIxZC00NzU0LThkYTQtZjNhNTljMTA1MDA1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
          body: "the best film ever made",
          released: "07 Nov 2003",
        };
        const expected = {
          author: "cat_man",
          body: "the best film ever made",
          created_at: expect.any(String),
          movie_id: "tt0319343",
          movie_poster:
            "https://m.media-amazon.com/images/M/MV5BMzUxNzkzMzQtYjIxZC00NzU0LThkYTQtZjNhNTljMTA1MDA1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
          movie_title: "Elf",
          post_id: 8,
          released: "07 Nov 2003",
          user_id: 4,
          likes: 0,
          media_type: "movie",
        };
        return request(app)
          .post("/api/posts")
          .send(fakeUser)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Body Invalid");
          });
      });
      test("400: responds with error if missing required field", () => {
        return request(app)
          .post("/api/posts")
          .send({
            author: "cat_man",
            body: "the best film ever made",
          })
          .expect(400);
      });
      test("404: error when user does not exist", () => {
        return request(app)
          .get("/api/users/98798/favourites")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("User Not Found");
          });
      });
    });
  });

  describe("/api/posts/:post_id", () => {
    describe("GET", () => {
      test("200: responds with specified post object", () => {
        return request(app)
          .get("/api/posts/1")
          .expect(200)
          .then((res) => {
            expect(res.body.post).toEqual({
              created_at: expect.any(String),
              post_id: 1,
              likes: expect.any(Number),
              author: "KeanuIsTheBest",
              user_id: 1,
              movie_title: "You Were Never Really Here",
              movie_id: "398181",
              released: "06 Apr 2018",
              movie_poster: "/px6v0kY4rmHOcBTA7zelfD196Sd.jpg",
              body: "very good, I cry.",
              comment_count: expect.any(Number),
              genres: ["crime", "drama"],
              media_type: "movie",
            });
          });
      });
      test("404: error when post doesn't exist", () => {
        return request(app)
          .get("/api/posts/1446")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("Resource not found");
          });
      });
    });
    describe("PATCH", () => {
      test("200: changes post info and returns updated post object", () => {
        return request(app)
          .patch("/api/posts/1")
          .send({ body: "changed my mind" })
          .expect(200)
          .then((res) => {
            expect(res.body.post).toEqual(
              expect.objectContaining({ body: "changed my mind" })
            );
          });
      });
      test("404: Post not found", () => {
        return request(app)
          .patch("/api/posts/1324")
          .send({ body: "changed my mind" })
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("Post Not Found");
          });
      });
    });
    describe("DELETE", () => {
      test("204: deletes post", () => {
        return request(app).delete("/api/posts/1").expect(204);
      });
      test("404: not found", () => {
        return request(app)
          .delete("/api/posts/135434")
          .expect(404)
          .then((res) => expect(res.body.msg).toBe("ID Not Found"));
      });
    });
  });

  describe("/api/:movie_id/posts", () => {
    describe("GET", () => {
      test("200: responds with all posts related to specified movie", () => {
        return request(app)
          .get("/api/9279/posts")
          .expect(200)
          .then((res) => {
            res.body.posts.forEach((post) => {
              expect(post).toEqual({
                author: expect.any(String),
                body: expect.any(String),
                movie_title: expect.any(String),
                user_id: expect.any(Number),
                movie_id: expect.any(String),
                released: expect.any(String),
                created_at: expect.any(String),
                movie_poster: expect.any(String),
                likes: expect.any(Number),
                post_id: expect.any(Number),
                comment_count: expect.any(Number),
                media_type: "movie",
              });
            });
          });
      });
    });
  });

  describe("/api/users/:user_id/posts", () => {
    describe("GET", () => {
      test("200: responds with posts made by specified user", () => {
        return request(app)
          .get("/api/users/1/posts")
          .expect(200)
          .then((res) => {
            res.body.posts.forEach((post) => {
              expect(post).toEqual({
                author: expect.any(String),
                body: expect.any(String),
                movie_title: expect.any(String),
                user_id: 1,
                movie_id: expect.any(String),
                released: expect.any(String),
                created_at: expect.any(String),
                movie_poster: expect.any(String),
                likes: expect.any(Number),
                post_id: expect.any(Number),
                comment_count: expect.any(Number),
                profile_pic:
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                rating: 5,
                media_type: "movie",
              });
            });
          });
      });
    });
  });
});

describe("Watched", () => {
  describe("/api/users/:user_id/watched", () => {
    describe("GET", () => {
      test("200: responds with an array of watched objects for specified user", () => {
        return request(app)
          .get("/api/users/1/watched")
          .expect(200)
          .then((res) => {
            res.body.watched.forEach((watched) => {
              expect(watched).toEqual({
                movie_id: expect.any(String),
                user_id: 1,
                watched_id: expect.any(Number),
                movie_poster: expect.any(String),
                movie_title: expect.any(String),
                created_at: expect.any(String),
                type: "watched",
              });
            });
          });
      });
    });

    describe("POST", () => {
      test("201: adds a new watched movie", () => {
        const newFav = {
          movie_id: "tt0109248",
          movie_poster: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
          movie_title: "Watever",
        };
        return request(app)
          .post("/api/users/2/watched")
          .send(newFav)
          .expect(201)
          .then((res) => {
            expect(res.body.watched).toEqual({
              movie_id: "tt0109248",
              user_id: 2,
              watched_id: expect.any(Number),
              movie_poster: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
              movie_title: "Watever",
              created_at: expect.any(String),
              type: "watched",
            });
          });
      });
    });
  });

  describe("/api/users/:user_id/watched?queries", () => {
    describe("GET", () => {
      test("200: responds with watched sorted in specified order", () => {
        return request(app)
          .get("/api/users/1/watched?order=ASC")
          .expect(200)
          .then((res) => {
            expect(res.body.watched).toBeSortedBy("created_at", {
              ascending: true,
            });
          });
      });
      test("400: error invalid order", () => {
        return request(app)
          .get("/api/users/1/watched?order=balls")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid order query");
          });
      });
    });
  });

  describe("/api/watched/:watched_id", () => {
    describe("DELETE", () => {
      test("204: deletes watched movie", () => {
        return request(app).delete("/api/watched/1").expect(204);
      });
    });
  });
});

describe("Comments", () => {
  describe("/api/posts/:post_id/comments", () => {
    describe("GET", () => {
      test("200: responds with an array of comments for specified post", () => {
        return request(app)
          .get("/api/posts/1/comments")
          .expect(200)
          .then((res) => {
            res.body.comments.forEach((comment) => {
              expect(comment).toEqual({
                body: expect.any(String),
                post: 1,
                comment_id: expect.any(Number),
                user_id: expect.any(Number),
                author: expect.any(String),
                created_at: expect.any(String),
                type: "comment",
              });
            });
          });
      });
    });
    describe("POST", () => {
      test("200: adds comment and responds with newly added comment", () => {
        const newComment = {
          body: "thats a hot take!",
          user_id: "1",
          author: "KeanuIsTheBest",
        };
        return request(app)
          .post("/api/posts/1/comments")
          .send(newComment)
          .expect(201)
          .then((res) => {
            expect(res.body.comment).toEqual({
              body: expect.any(String),
              post: 1,
              comment_id: expect.any(Number),
              user_id: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
              type: "comment",
            });
          });
      });
    });
  });

  describe("/api/comments/:comment_id", () => {
    describe("PATCH", () => {
      test("200: updates comment body and returns updated comment", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ body: "this is an update" })
          .expect(200)
          .then((res) => {
            expect(res.body.comment).toEqual({
              user_id: 1,
              comment_id: 1,
              post: 2,
              author: "KeanuIsTheBest",
              body: "this is an update",
              created_at: expect.any(String),
              type: "comment",
            });
          });
      });
    });
    describe("DELETE", () => {
      test("204: removes comment", () => {
        return request(app).delete("/api/comments/1").expect(204);
      });
    });
  });
});

describe("Followers", () => {
  describe("/api/users/:user_id/followers", () => {
    describe("GET", () => {
      const expected = {
        followers: [
          {
            user_id: 2,
            username: "benny_andthejets",
            profile_pic: expect.any(String),
            name: "jimathanny elton",
            created_at: expect.any(String),
          },
          {
            user_id: 3,
            username: "your_nan",
            profile_pic: expect.any(String),
            name: "hey you",
            created_at: expect.any(String),
          },
          {
            user_id: 5,
            username: "curryboi69",
            profile_pic: expect.any(String),
            name: "barry tikka",
            created_at: expect.any(String),
          },
          {
            user_id: 6,
            username: "goth_geeza_666",
            profile_pic: expect.any(String),
            name: "ozzy oblong",
            created_at: expect.any(String),
          },
        ],
        following: [
          {
            user_id: 2,
            username: "benny_andthejets",
            profile_pic: expect.any(String),
            name: "jimathanny elton",
            created_at: expect.any(String),
          },
          {
            user_id: 3,
            username: "your_nan",
            profile_pic: expect.any(String),
            name: "hey you",
            created_at: expect.any(String),
          },
          {
            user_id: 4,
            username: "cat_man",
            profile_pic: expect.any(String),
            name: "tim robbins",
            created_at: expect.any(String),
          },
          {
            user_id: 5,
            username: "curryboi69",
            profile_pic: expect.any(String),
            name: "barry tikka",
            created_at: expect.any(String),
          },
          {
            user_id: 6,
            username: "goth_geeza_666",

            profile_pic: expect.any(String),
            name: "ozzy oblong",
            created_at: expect.any(String),
          },
        ],
      };
      test("200: responds with followers and following array", () => {
        return request(app)
          .get("/api/users/1/followers")
          .expect(200)
          .then((res) => {
            expect(res.body.followData).toEqual(expected);
          });
      });
    });
    describe("POST", () => {
      test("201: follows the specified user", () => {
        return request(app)
          .post("/api/users/2/followers")
          .send({ following: 3 })
          .expect(201)
          .then((res) => {
            expect(res.body.following).toEqual({
              user_id: 2,
              following: 3,
              created_at: expect.any(String),
            });
          });
      });
    });
    describe("DELETE", () => {
      test("204: deletes following/unfollows user", () => {
        return request(app)
          .delete("/api/users/3/followers")
          .send({ following: 1, user_id: 3 })
          .expect(204);
      });
    });
  });

  describe("/api/users/:user_id/followers?queries", () => {
    describe("GET", () => {
      const expected = {
        followers: [
          {
            user_id: 2,
            username: "benny_andthejets",
            profile_pic: expect.any(String),

            name: "jimathanny elton",
            created_at: expect.any(String),
          },
          {
            user_id: 3,
            username: "your_nan",
            profile_pic: expect.any(String),
            name: "hey you",
            created_at: expect.any(String),
          },
          {
            user_id: 5,
            username: "curryboi69",
            profile_pic: expect.any(String),
            name: "barry tikka",
            created_at: expect.any(String),
          },
          {
            user_id: 6,
            username: "goth_geeza_666",
            profile_pic: expect.any(String),
            name: "ozzy oblong",
            created_at: expect.any(String),
          },
        ],
        following: [
          {
            user_id: 2,
            username: "benny_andthejets",
            profile_pic: expect.any(String),
            name: "jimathanny elton",
            created_at: expect.any(String),
          },
          {
            user_id: 3,
            username: "your_nan",
            profile_pic: expect.any(String),
            name: "hey you",
            created_at: expect.any(String),
          },
          {
            user_id: 4,
            username: "cat_man",
            profile_pic: expect.any(String),
            name: "tim robbins",
            created_at: expect.any(String),
          },
          {
            user_id: 5,
            username: "curryboi69",
            profile_pic: expect.any(String),
            name: "barry tikka",
            created_at: expect.any(String),
          },
          {
            user_id: 6,
            username: "goth_geeza_666",
            profile_pic: expect.any(String),

            name: "ozzy oblong",
            created_at: expect.any(String),
          },
        ],
      };
      test("200: responds with followers sorted in specified order", () => {
        return request(app)
          .get("/api/users/1/followers?order=ASC")
          .expect(200)
          .then((res) => {
            expect(res.body.followData.followers).toBeSortedBy("created_at", {
              ascending: true,
            });
          });
      });
      test("400: error invalid order", () => {
        return request(app)
          .get("/api/users/1/followers?order=balls")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid order query");
          });
      });
    });
  });
});

describe("Post likes", () => {
  describe("/api/post_likes/:post_id", () => {
    describe("POST", () => {
      test("201: posts a new like and returns like object", () => {
        return request(app)
          .post("/api/post_likes")
          .send({ post_id: 3, user_id: 1 })
          .expect(201)
          .then((res) => {
            expect(res.body.like).toEqual({
              post: 3,
              user_id: 1,
              created_at: expect.any(String),
              like_id: expect.any(Number),
              type: "post_like",
            });
          });
      });
    });

    describe("DELETE", () => {
      test("204: deletes like", () => {
        return request(app)
          .delete("/api/post_likes")
          .send({ post_id: 1, user_id: 3 })
          .expect(204);
      });
    });
  });

  describe("/api/posts/:post_id/post_likes", () => {
    describe("GET", () => {
      test("200: responds with all users who liked the post", () => {
        const expected = [
          {
            user_id: 2,
            profile_pic: expect.any(String),

            username: "benny_andthejets",
            name: "jimathanny elton",
          },
          {
            user_id: 3,
            profile_pic: expect.any(String),

            username: "your_nan",
            name: "hey you",
          },
          {
            user_id: 4,
            profile_pic: expect.any(String),

            username: "cat_man",
            name: "tim robbins",
          },
          {
            user_id: 5,
            profile_pic: expect.any(String),

            username: "curryboi69",
            name: "barry tikka",
          },
          {
            user_id: 6,
            profile_pic: expect.any(String),

            username: "goth_geeza_666",
            name: "ozzy oblong",
          },
        ];
        return request(app)
          .get("/api/posts/1/post_likes")
          .expect(200)
          .then((res) => {
            expect(res.body.users).toEqual(expected);
          });
      });
    });
  });
});

describe("Ratings", () => {
  describe("/api/ratings/:movie_id", () => {
    describe("GET", () => {
      test("200: returns average of all user ratings for specified movie", () => {
        return request(app)
          .get("/api/ratings/9279")
          .expect(200)
          .then((res) => {
            expect(res.body.rating).toBe(3.3);
          });
      });
    });
  });

  describe("/api/users/:user_id/ratings/:movie_id", () => {
    describe("POST", () => {
      test("201: adds rating and returns new rating object", () => {
        return request(app)
          .post("/api/users/2/ratings/tt0080684")
          .send({
            rating: 5,
            movie_title: "Star Wars: Episode V - The Empire Strikes Back",
            movie_poster:
              "https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
          })
          .expect(201)
          .then((res) => {
            expect(res.body.rating).toEqual({
              user_id: 2,
              movie_id: "tt0080684",
              rating: 5,
              rating_id: expect.any(Number),
              created_at: expect.any(String),
              type: "rating",
              movie_title: "Star Wars: Episode V - The Empire Strikes Back",
              movie_poster:
                "https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
            });
          });
      });
    });
    describe("DELETE", () => {
      test("204: removes rating", () => {
        return request(app).delete("/api/users/1/ratings/398181").expect(204);
      });
    });
    describe("PATCH", () => {
      test("201: changes rating and returns updated rating", () => {
        return request(app)
          .patch("/api/users/1/ratings/398181")
          .send({ rating: 2 })
          .expect(200)
          .then((res) => {
            expect(res.body.rating).toEqual({
              user_id: 1,
              movie_id: "398181",
              rating: 2,
              rating_id: expect.any(Number),
              created_at: expect.any(String),
              type: "rating",
              movie_title: "You Were Never Really Here",
              movie_poster: "/px6v0kY4rmHOcBTA7zelfD196Sd.jpg",
            });
          });
      });
    });
  });
});

describe("Genres", () => {
  describe("/api/posts/:post_id/genres", () => {
    describe("GET", () => {
      test("200: returns genres related to specified post", () => {
        return request(app)
          .get("/api/posts/1/genres")
          .expect(200)
          .then((res) => {
            expect(res.body.postGenres).toEqual([
              { genre: "crime" },
              { genre: "drama" },
            ]);
          });
      });
    });
    describe("POST", () => {
      test("201: adds genres related to specified post and returns array of new genre objects", () => {
        const sending = { genres: "Action, Crime" };
        return request(app)
          .post("/api/posts/1/genres")
          .send(sending)
          .expect(201)
          .then((res) => {
            expect(res.body.postGenres).toEqual([
              { post: 1, genre: "action" },
              { post: 1, genre: "crime" },
            ]);
          });
      });
      test("201: works with single genre", () => {
        const sending = { genres: "Action" };
        return request(app)
          .post("/api/posts/1/genres")
          .send(sending)
          .expect(201)
          .then((res) => {
            expect(res.body.postGenres).toEqual([{ post: 1, genre: "action" }]);
          });
      });
    });
    describe("DELETE", () => {
      test("204: removes genre", () => {
        const sending = { genre: "action" };
        return request(app)
          .delete("/api/posts/1/genres")
          .send(sending)
          .expect(204);
      });
    });
  });
});

describe("Activity", () => {
  describe("/api/users/:user_id/activity", () => {
    describe("GET", () => {
      test("returns all activity", () => {
        return request(app)
          .get("/api/users/3/activity")
          .expect(200)
          .then((res) => {
            expect(res.body.activity.length).toBe(9);
            expect(res.body.activity).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ type: "post_like" }),
                expect.objectContaining({ type: "post_like" }),
                expect.objectContaining({ type: "post_like" }),
                expect.objectContaining({ type: "post_like" }),
                expect.objectContaining({ type: "comment" }),
                expect.objectContaining({ type: "rating" }),
                expect.objectContaining({ type: "rating" }),
                expect.objectContaining({ type: "watched" }),
                expect.objectContaining({ type: "watched" }),
              ])
            );
          });
      });
    });
  });

  describe("/api/users/:user_id/followers/activity", () => {
    describe("GET", () => {
      test("returns all follower activity but posts", () => {
        return request(app)
          .get("/api/users/6/follower_activity")
          .expect(200)
          .then((res) => {
            res.body.activity.forEach((item) => {
              expect(item.user_id.toString()).toMatch(/1|5/);
            });
          });
      });
    });
  });
});
