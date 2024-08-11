import request from "supertest";
import app from "../../server.js";
import User from "../..//models/userModels.js";
import Asset from "../../models/assetModel.js";
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

describe("Asset Controller", () => {
  let token, user;

  beforeEach(async () => {
    user = await User.create({
      username: "testuser",
      password: "password123",
      email: "testuser@example.com",
    });
    token = generateToken(user._id);
  });

  it("should create an asset", async () => {
    const res = await request(app)
      .post("/assets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Asset",
        description: "A description",
        image: "http://example.com/image.jpg",
        status: "draft",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Asset created successfully");

    const asset = await Asset.findOne({ name: "Test Asset" });
    expect(asset).toBeTruthy();
    expect(asset.creator.toString()).toBe(user._id.toString());
  });

  it("should update an asset", async () => {
    const asset = await Asset.create({
      name: "Test Asset",
      description: "A description",
      image: "http://example.com/image.jpg",
      status: "draft",
      creator: user._id,
      currentHolder: user._id,
    });

    const res = await request(app)
      .post(`/assets/${asset._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Asset",
        description: "Updated description",
        image: "http://example.com/newimage.jpg",
        status: "published",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Asset updated successfully");

    const updatedAsset = await Asset.findById(asset._id);
    expect(updatedAsset.name).toBe("Updated Asset");
    expect(updatedAsset.status).toBe("published");
  });

  it("should publish an asset", async () => {
    const asset = await Asset.create({
      name: "Test Asset",
      description: "A description",
      image: "http://example.com/image.jpg",
      status: "draft",
      creator: user._id,
      currentHolder: user._id,
    });

    const res = await request(app)
      .put(`/assets/${asset._id}/publish`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Asset published successfully");

    const publishedAsset = await Asset.findById(asset._id);
    expect(publishedAsset.status).toBe("published");
  });

  it("should get asset details", async () => {
    const asset = await Asset.create({
      name: "Test Asset",
      description: "A description",
      image: "http://example.com/image.jpg",
      status: "published",
      creator: user._id,
      currentHolder: user._id,
    });

    const res = await request(app)
      .get(`/assets/${asset._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Test Asset");
    expect(res.body.creator.username).toBe("testuser");
    expect(res.body.currentHolder.username).toBe("testuser");
  });

  it("should get user assets", async () => {
    await Asset.create({
      name: "Test Asset 1",
      description: "Description 1",
      image: "http://example.com/image1.jpg",
      status: "published",
      creator: user._id,
      currentHolder: user._id,
    });

    await Asset.create({
      name: "Test Asset 2",
      description: "Description 2",
      image: "http://example.com/image2.jpg",
      status: "draft",
      creator: user._id,
      currentHolder: user._id,
    });

    const res = await request(app)
      .get(`/assets/user/${user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe("Test Asset 1");
    expect(res.body[1].name).toBe("Test Asset 2");
  });
});
