process.env.NODE_ENV = "test";
const { expect } = require("chai");
const app = require("../app");
const request = require("supertest")(app);

describe("/api", () => {
  it("GET returns 200 and welcome message", () => {
    return request
      .get("/api/")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).to.equal("Welcome!");
      });
  });
  describe("/topics", () => {
    it("GET returns 200 and array of topic objects", () => {
      return request
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics); //finish off hereeee
        });
    });
  });
});
