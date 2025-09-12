const request = require("supertest");
const app = require("../app"); // Adjust path if needed

let verificationToken;
let resetToken;
let authToken;

describe("User Endpoints", () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = "Test@1234";
  const testPhone = "1234567890";

  it("should register a user", async () => {
    const res = await request(app).post("/user/register").send({
      email: testEmail,
      password: testPassword,
      name: "Test User",
      phone: testPhone,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    verificationToken = res.body.verificationLink.split("token=")[1];
  });

  it("should verify email", async () => {
    const res = await request(app).get(
      `/user/verify-email?token=${verificationToken}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/verified/i);
  });

  it("should login", async () => {
    const res = await request(app).post("/user/login").send({
      email: testEmail,
      password: testPassword,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it("should get profile", async () => {
    const res = await request(app)
      .get("/user/profile")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it("should request forgot password", async () => {
    const res = await request(app)
      .post("/user/forgot-password")
      .send({ email: testEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.resetLink).toBeDefined();
    resetToken = res.body.resetLink.split("token=")[1];
  });

  it("should reset password", async () => {
    const res = await request(app)
      .post(`/user/reset-password?token=${resetToken}`)
      .send({ newPassword: "NewTest@1234" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successful/i);
  });

  it("should logout", async () => {
    const res = await request(app)
      .post("/user/logout")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });
});
