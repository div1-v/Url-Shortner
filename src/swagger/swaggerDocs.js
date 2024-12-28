module.exports = {
  openapi: "3.0.0",
  info: {
    title: "URL Shortening API",
    version: "1.0.0",
    description: "API for shortening URLs and analyzing link traffic.",
  },

  servers: [
    {
      url: `${process.env.BASE_URL}/api`, // Change this to your server URL
    },
  ],
  tags: [
    {
      name: "url-shortening",
      description: "Operations related to URL shortening and traffic analysis",
    },
    {
      name: "authentication",
      description: "Operations related to user authentication (Google OAuth)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Optional: If using JWT tokens
      },
    },
  },
  security: [
    {
      bearerAuth: [], 
    },
  ],

  paths: {
    "/shorten": {
      post: {
        tags: ["url-shortening"],
        summary: "Create a new short URL",
        description:
          "Create a new short URL to facilitate easy sharing of long URLs.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  longUrl: {
                    type: "string",
                    description: "The original long URL to be shortened.",
                    default: "https://example.com/long-url",
                  },
                  customAlias: {
                    type: "string",
                    description: "A custom alias for the short URL (optional).",
                    default: "my-custom-alias",
                  },
                  topic: {
                    type: "string",
                    description:
                      "A category to group the short URL (optional).",
                    default: "general",
                  },
                },
                required: ["longUrl"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "The generated short URL.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    shortUrl: {
                      type: "string",
                      description: "The generated short URL.",
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                      description: "Timestamp of URL creation.",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request body.",
          },
          500: {
            description: "Internal server error.",
          },
        },
      },
    },
    "/shorten/{alias}": {
      get: {
        tags: ["url-shortening"],
        summary: "Redirect to the original long URL",
        description:
          "Redirect to the original URL based on the short URL alias.",
        parameters: [
          {
            name: "alias",
            in: "path",
            required: true,
            description: "The alias of the short URL.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          301: {
            description: "Redirect to the original long URL.",
          },
          404: {
            description: "URL not found.",
          },
        },
      },
    },
    "/analytics/{alias}": {
      get: {
        security: [
          {
            bearerAuth: [],
          },
        ],
        tags: ["url-shortening"],
        summary: "Retrieve analytics for a specific short URL",
        description:
          "Get detailed analytics for a short URL, including clicks, unique users, and device/OS data.",
        parameters: [
          {
            name: "alias",
            in: "path",
            required: true,
            description: "The alias of the short URL.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Analytics data for the short URL.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalClicks: {
                      type: "integer",
                    },
                    uniqueClicks: {
                      type: "integer",
                    },
                    clicksByDate: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: {
                            type: "string",
                            description: "Date in YYYY-MM-DD format.",
                          },
                          clickCount: {
                            type: "integer",
                            description: "Total number of clicks on that date.",
                          },
                        },
                      },
                    },
                    osType: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          osName: {
                            type: "string",
                            description: "The name of the operating system.",
                          },
                          uniqueClicks: {
                            type: "integer",
                          },
                          uniqueUsers: {
                            type: "integer",
                          },
                        },
                      },
                    },
                    deviceType: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          deviceName: {
                            type: "string",
                            description: "The type of device.",
                          },
                          uniqueClicks: {
                            type: "integer",
                          },
                          uniqueUsers: {
                            type: "integer",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "URL not found.",
          },
        },
      },
    },
    "/analytics/overall": {
      get: {
        security: [
          {
            bearerAuth: [],
          },
        ],
        tags: ["url-shortening"],
        summary: "Retrieve overall analytics for all URLs",
        description:
          "Retrieve overall analytics for all short URLs created by the authenticated user.",
        responses: {
          200: {
            description: "Overall analytics data.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalUrls: {
                      type: "integer",
                    },
                    totalClicks: {
                      type: "integer",
                    },
                    uniqueClicks: {
                      type: "integer",
                    },
                    clicksByDate: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: {
                            type: "string",
                          },
                          clickCount: {
                            type: "integer",
                          },
                        },
                      },
                    },
                    osType: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          osName: {
                            type: "string",
                          },
                          uniqueClicks: {
                            type: "integer",
                          },
                          uniqueUsers: {
                            type: "integer",
                          },
                        },
                      },
                    },
                    deviceType: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          deviceName: {
                            type: "string",
                          },
                          uniqueClicks: {
                            type: "integer",
                          },
                          uniqueUsers: {
                            type: "integer",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/analytics/topic/{topic}": {
      get: {
        security: [
          {
            bearerAuth: [],
          },
        ],
        tags: ["url-shortening"],
        summary: "Retrieve analytics for all URLs in a specific topic",
        description: "Get analytics for all short URLs under a specific topic.",
        parameters: [
          {
            name: "topic",
            in: "path",
            required: true,
            description: "The topic for which to fetch analytics.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Topic-based analytics data.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalClicks: {
                      type: "integer",
                    },
                    uniqueClicks: {
                      type: "integer",
                    },
                    clicksByDate: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: {
                            type: "string",
                          },
                          clickCount: {
                            type: "integer",
                          },
                        },
                      },
                    },
                    urls: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          shortUrl: {
                            type: "string",
                          },
                          totalClicks: {
                            type: "integer",
                          },
                          uniqueClicks: {
                            type: "integer",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/google/register": {
      get: {
        tags: ["authentication"],
        summary: "Register or Login using google",
        description: "Create or login to account using google sign in. Try this url on another tab.",
        
        parameters: [],
        responses: {
          200: {
            description: "Access token",
          },
        },
      },
    },
  },
};
