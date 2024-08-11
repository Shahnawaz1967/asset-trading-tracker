import request from "supertest";
import app from "../../server.js";
import User from "../../models/userModels.js";
import Asset from "../../models/assetModel.js";
import Request from "../../models/requestModel.js";
import { generateToken } from "../../utils/generateToken.js";
let server;

server = app.listen(5001, () => {
  console.log('Test server running on port 5001');
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe("Marketplace Controller", () => {
  let token, user, asset;

  beforeEach(async () => {
    user = await User.create({
      username: "testuser",
      password: "password123",
      email: "testuser@example.com",
    });
    token = generateToken(user._id);

    asset = await Asset.create({
      name: "Test Asset",
      description: "A description",
      image: "http://example.com/image.jpg",
      status: "published",
      creator: user._id,
      currentHolder: user._id,
    });
  });

  it("should get assets listed on the marketplace", async () => {
    const res = await request(app)
      .get("/marketplace/assets")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Test Asset");
  });

  it("should request to buy an asset", async () => {
    const res = await request(app)
      .post(`/marketplace/assets/${asset._id}/request`)
      .set("Authorization", `Bearer ${token}`)
      .send({ proposedPrice: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Purchase request sent");

    const requestEntry = await Request.findOne({ asset: asset._id });
    expect(requestEntry).toBeTruthy();
    expect(requestEntry.proposedPrice).toBe(100);
    expect(requestEntry.buyer.toString()).toBe(user._id.toString());
  });

  it("should accept a purchase request", async () => {
    const buyer = await User.create({
      username: "buyeruser",
      password: "password123",
      email: "buyeruser@example.com",
    });
    const buyerToken = generateToken(buyer._id);

    const requestEntry = await Request.create({
      asset: asset._id,
      proposedPrice: 100,
      buyer: buyer._id,
      status: "pending",
    });

    const res = await request(app)
      .put(`/marketplace/requests/${requestEntry._id}/accept`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Request accepted, holder updated");

    const updatedAsset = await Asset.findById(asset._id);
    expect(updatedAsset.currentHolder.toString()).toBe(buyer._id.toString());
  });

  it("should deny a purchase request", async () => {
    const buyer = await User.create({
      username: "buyeruser",
      password: "password123",
      email: "buyeruser@example.com",
    });
    const buyerToken = generateToken(buyer._id);

    const requestEntry = await Request.create({
      asset: asset._id,
      proposedPrice: 100,
      buyer: buyer._id,
      status: "pending",
    });

    const res = await request(app)
      .put(`/marketplace/requests/${requestEntry._id}/deny`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Request denied");

    const deniedRequest = await Request.findById(requestEntry._id);
    expect(deniedRequest.status).toBe("denied");
  });

  it("should negotiate a purchase request", async () => {
    const buyer = await User.create({
      username: "buyeruser",
      password: "password123",
      email: "buyeruser@example.com",
    });
    const buyerToken = generateToken(buyer._id);

    const requestEntry = await Request.create({
      asset: asset._id,
      proposedPrice: 100,
      buyer: buyer._id,
      status: "pending",
    });

    const res = await request(app)
      .put(`/marketplace/requests/${requestEntry._id}/negotiate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ newProposedPrice: 150 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Negotiation updated");

    const updatedRequest = await Request.findById(requestEntry._id);
    expect(updatedRequest.proposedPrice).toBe(150);
  });

  it("should get user purchase requests", async () => {
    const buyer = await User.create({
      username: "buyeruser",
      password: "password123",
      email: "buyeruser@example.com",
    });
    const buyerToken = generateToken(buyer._id);

    await Request.create({
      asset: asset._id,
      proposedPrice: 100,
      buyer: buyer._id,
      status: "pending",
    });

    const res = await request(app)
      .get(`/marketplace/requests/user/${buyer._id}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].proposedPrice).toBe(100);
  });
});
