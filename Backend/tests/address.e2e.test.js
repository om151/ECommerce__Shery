const request = require("supertest");
const app = require("../app");

let authToken;
let createdAddressId;
let verificationToken;

// Re-use pattern from user test but keep lighter
const uniqueEmail = `addr_user_${Date.now()}@example.com`;
const password = "AddrUser@123";

const baseAddress = {
  label: "Home",
  line1: "123 Test Street",
  line2: "",
  city: "Testville",
  state: "TX",
  postalCode: "123456",
  country: "USA",
};

describe("Address Routes", () => {
  jest.setTimeout(30000);

  it("register user (for address tests)", async () => {
    const res = await request(app).post("/user/register").send({
      email: uniqueEmail,
      password,
      name: "Address Tester",
      phone: "1112223333",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    verificationToken = res.body.verificationLink.split("token=")[1];
  });

  it("verify email", async () => {
    const res = await request(app).get(
      `/user/verify-email?token=${verificationToken}`
    );
    expect(res.statusCode).toBe(200);
  });

  it("login user", async () => {
    const res = await request(app).post("/user/login").send({
      email: uniqueEmail,
      password,
    });
    expect(res.statusCode).toBe(200);
    authToken = res.body.token;
    expect(authToken).toBeDefined();
  });

  it("create address", async () => {
    const res = await request(app)
      .post("/address")
      .set("Authorization", `Bearer ${authToken}`)
      .send(baseAddress);
    expect(res.statusCode).toBe(201);
    expect(res.body.address).toBeDefined();
    createdAddressId = res.body.address._id;
  });

  it("prevent duplicate address", async () => {
    const res = await request(app)
      .post("/address")
      .set("Authorization", `Bearer ${authToken}`)
      .send(baseAddress);
    expect([409, 400]).toContain(res.statusCode); // prefer 409
  });

  it("list addresses", async () => {
    const res = await request(app)
      .get("/address")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.addresses)).toBe(true);
    expect(res.body.addresses.length).toBeGreaterThanOrEqual(1);
  });

  it("get single address", async () => {
    const res = await request(app)
      .get(`/address/${createdAddressId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.address._id).toBe(createdAddressId);
  });

  it("update address", async () => {
    const res = await request(app)
      .put(`/address/${createdAddressId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ label: "Primary Home" });
    expect(res.statusCode).toBe(200);
    expect(res.body.address.label).toBe("Primary Home");
  });

  it("delete address", async () => {
    const res = await request(app)
      .delete(`/address/${createdAddressId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
  });

  it("get deleted address -> 404", async () => {
    const res = await request(app)
      .get(`/address/${createdAddressId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(404);
  });
});
