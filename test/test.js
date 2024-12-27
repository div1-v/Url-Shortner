const request = require("supertest");
const app = require("../server"); // Adjust to the path where your Express app is defined

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzZjZmVkNzJkY2RlOWE4NmU4MGU0YzMiLCJuYW1lIjoiSmV0aGEgTGFsIiwiZW1haWwiOiJnYW1pbmdjYWZlNTczQGdtYWlsLmNvbSIsImlhdCI6MTczNTMxODYxMSwiZXhwIjoxNzM1MzIyMjExfQ.I4VvgmfqXLoP2g68vuFxRlbyANfBZoY7AV09Ozrleh8";

describe("URL Shortener API", () => {
  // Test for URL shortening
  describe("POST /shorten", () => {
    it("should shorten the URL and return the shortened URL", async () => {
      // Arrange
      const mockLongUrl = `https://cloud.redis.io/#/login`;
      const mockAlias = "";
      const mockTopic = "tech";

      const response = await request(app)
        .post("/api/shorten")
        .set("Authorization", token)
        .send({
          longUrl: mockLongUrl,
          customAlias: mockAlias,
          topic: mockTopic,
        });

      // Assert
      expect(response.status).toBe(200);
    });

    it("should shorten the URL and return the shortened URL", async () => {
      // Arrange
      const mockLongUrl = `https://cloud.redis.io/#/login`;
      const mockAlias = "customAliassd";
      const mockTopic = "tech";

      const response = await request(app)
        .post("/api/shorten")
        .set("Authorization", "no token")
        .send({
          longUrl: mockLongUrl,
          customAlias: mockAlias,
          topic: mockTopic,
        });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // Test for URL alias retrieval
  describe("GET /shorten/:alias", () => {
    it("should redirect to the original URL for the given alias", async () => {
      // Arrange
      const alias = "customAlias";

      const response = await request(app).get(`/api/shorten/${alias}`);

      // Assert
      expect(response.status).toBe(301);
      expect(response.header.location).toBeDefined();
    });

    it("should return 404 if alias not found", async () => {
      // Arrange
      const alias = "nonexistentAlias";

      const response = await request(app).get(`/api/shorten/${alias}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Url not found");
    });
  });

  // Test for URL analytics retrieval
  describe("GET /analytics/:alias", () => {
    it("should return analytics for the given URL alias", async () => {
      // Arrange
      const alias = "customAlias";

      const response = await request(app)
        .get(`/api/analytics/${alias}`)
        .set("Authorization", token); // Mock authentication header

      // Assert
      expect(response.status).toBe(200);
      expect(Number(response.body.totalClicks)).toBeGreaterThanOrEqual(0);
      expect(Number(response.body.uniqueUsers)).toBeGreaterThanOrEqual(0);
    });
  });

  // Test for topic analytics retrieval
  describe("GET /analytics/topic/:topic", () => {
    it("should return analytics for the given topic", async () => {
      const topic = "new";

      const response = await request(app)
        .get(`/api/analytics/topic/${topic}`)
        .set("Authorization", token);

      // Assert
      console.log(
        response.body.totalClicks,
        typeof response.body.uniqueUsers,
        /OK/
      );
      expect(response.status).toBe(200);
      expect(Number(response.body.totalClicks)).toBeGreaterThanOrEqual(0);
      expect(Number(response.body.uniqueUsers)).toBeGreaterThanOrEqual(0);
    });
  });

  // Test for overall analytics retrieval
  describe("GET /analytics/overall", () => {
    it("should return overall analytics", async () => {
      const response = await request(app)
        .get("/api/analytics/overall")
        .set("Authorization", token);

      // Assert
      expect(response.status).toBe(200);
      expect(Number(response.body.totalUrls)).toBeGreaterThanOrEqual(0);
      expect(Number(response.body.totalClicks)).toBeGreaterThanOrEqual(0);
      expect(Number(response.body.uniqueUsers)).toBeGreaterThanOrEqual(0);
    });
  });
});
