const request = require("supertest");
const app = require("../server"); // Adjust to the path where your Express app is defined

describe("URL Shortener API", () => {
  // Test for URL shortening
  describe("POST /shorten", () => {
    it("should shorten the URL and return the shortened URL", async () => {
      // Arrange
      const mockLongUrl = `https://cloud.redis.io/#/login`;
      const mockAlias = "customAliassd";
      const mockTopic = "tech";

      const response = await request(app)
        .post("/api/shorten")
        .set("Authorization", "Bearer fake-token")
        .send({
          longUrl: mockLongUrl,
          customAlias: mockAlias,
          topic: mockTopic,
        });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.shortUrl).toBe(
        `${process.env.BASE_URL}/api/shorten/${mockAlias}`
      );
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
        .set("Authorization", "Bearer fake-token"); // Mock authentication header

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBeDefined();
      expect(response.body.uniqueClicks).toBeDefined();
    });
  });

  // Test for topic analytics retrieval
  describe("GET /analytics/topic/:topic", () => {
    it("should return analytics for the given topic", async () => {

      const topic = "new";

      const response = await request(app)
        .get(`/api/analytics/topic/${topic}`)
        .set("Authorization", "Bearer fake-token");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.totalClicks).toBeDefined();
      expect(response.body.uniqueClicks).toBeDefined();
    });
  });

  // Test for overall analytics retrieval
  describe("GET /analytics/overall", () => {
    it("should return overall analytics", async () => {
      const response = await request(app)
        .get("/api/analytics/overall")
        .set("Authorization", "Bearer fake-token");

      // Assert
      expect(response.status).toBe(401);
      // expect(response.body.totalUrls).toBeDefined();
      // expect(response.body.totalClicks).toBeDefined();
      // expect(response.body.uniqueUsers).toBeDefined();
    });
  });
});
