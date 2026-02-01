const request = require("supertest");
const app = require("../app");

describe("Check-in Feature", () => {

  it("should check in successfully", async () => {
    const res = await request(app)
      .post("/checkin")
      .send({
        reservationId: "res1",
        checkInCode: "ABCDE"
      });

    expect(res.statusCode).toBe(200);
  });

  it("should fail if check-in code is invalid", async () => {
    const res = await request(app)
      .post("/checkin")
      .send({
        reservationId: "res1",
        checkInCode: "WRONG"
      });

    expect(res.statusCode).toBe(401);
  });

});
describe("Check-in Feature", () => {

  it("should check in successfully", async () => {
    const res = await request(app)
      .post("/checkin")
      .send({ reservationId: "res1", checkInCode: "ABCDE" });

    expect(res.statusCode).toBe(200);
  });

  it("should fail if check-in window expired", async () => {
    const res = await request(app)
      .post("/checkin")
      .send({ reservationId: "res1", checkInCode: "EXPIRED" });

    expect(res.statusCode).toBe(403);
  });

  it("should fail if check-in code is invalid", async () => {
    const res = await request(app)
      .post("/checkin")
      .send({ reservationId: "res1", checkInCode: "WRONG" });

    expect(res.statusCode).toBe(401);
  });

  it("should not allow double check-in", async () => {
    const res = await request(app)
      .post("/checkin")
      .send({ reservationId: "res1", checkInCode: "DOUBLE" });

    expect(res.statusCode).toBe(409);
  });

});
