URL Shortener & Analytics API
=============================

This Node.js application provides a service for shortening URLs, tracking clicks, and generating detailed analytics for each short URL. The application supports user authentication via Google Sign-In, provides analytics such as operating system usage, device type, and more, and implements rate limiting to prevent abuse. It also includes topic-based analytics to categorize URLs by topic.

Table of Contents
-----------------

1.  Installation
    
2.  Usage
    
3.  API Endpoints
    
    *   User Authentication
        
    *   Create Short URL
        
    *   Redirect Short URL
        
    *   Get URL Analytics
        
    *   Get Topic-Based Analytics
        
    *   Get Overall Analytics
        
4.  Rate Limiting
    
5.  Caching
    
Installation
------------

Follow these steps to install and run the application locally:

1.  git clone https://github.com/your-username/url-shortener-api.gitcd url-shortener

2. cd url-shortner

3. Run npm install command on your terminal

4. create a .env file to add environment variables used in application.
    
  PORT=3000

  MONGO_URI= mongodb_connection_string

  GOOGLE_CLIENT_ID=your_google_client_id

  GOOGLE_CLIENT_SECRET=your_google_client
  
  JWT_SECRET=jwt_secret

  BASE_URL = server base url

  REDIS_USERNAME=

  REDIS_PASS=

  REDIS_HOST=

  REDIS_PORT=


    
5.  npm start The server will start running at http://localhost:3000.
    

Usage
-----

Use a tool like Postman or cURL to interact with the API endpoints described below.

API Endpoints
-------------

### User Authentication

**Google Sign-In Authentication**:

**Endpoint**: /api/auth/google/register **Method**: GET

**Description**:  Redirect you to google login page. After successful login you
                  will get an access token. Use this access token to access all other api endpoints.
    

### Create Short URL

**Endpoint**: /api/shorten **Method**: POST

**Description**: Create a new short URL for easy sharing of long URLs.

**Request Body**:

{
  "longUrl": "https://example.com",
  "customAlias": "example",  // optional
  "topic": "marketing"       // optional
}

**Response**:

```json
{
  "shortUrl": "http://short.ly/example",
  "createdAt": "2024-12-27T12:00:00Z"
}

### Redirect Short URL

**Endpoint**: /api/shorten/{alias} **Method**: GET

**Description**: Redirect to the original URL based on the alia.

**Response**: Redirects the user to the original URL.


### Get URL Analytics

**Endpoint**: /api/analytics/{alias}**Method**: GET

**Description**: Retrieve detailed analytics for a specific short URL.

**Response**:

```json
{
  "totalClicks": 120,
  "uniqueUsers": 80,
  "clicksByDate": [
    { "date": "2024-12-20", "clicks": 15 },
    { "date": "2024-12-21", "clicks": 25 }
  ],
  "osType": [
    { "osName": "Windows", "uniqueClicks": 60, "uniqueUsers": 40 },
    { "osName": "Android", "uniqueClicks": 40, "uniqueUsers": 30 }
  ],
  "deviceType": [
    { "deviceName": "mobile", "uniqueClicks": 70, "uniqueUsers": 50 },
    { "deviceName": "desktop", "uniqueClicks": 50, "uniqueUsers": 30 }
  ]
}

### Get Topic-Based Analytics

**Endpoint**: /api/analytics/topic/{topic}**Method**: GET

**Description**: Retrieve analytics for all short URLs grouped under a specific topic.

**Response**:

```json
{
  "totalClicks": 300,
  "uniqueUsers": 200,
  "clicksByDate": [
    { "date": "2024-12-20", "clicks": 100 },
    { "date": "2024-12-21", "clicks": 200 }
  ],
  "urls": [
    {
      "shortUrl": "http://short.ly/example1",
      "totalClicks": 150,
      "uniqueUsers": 100
    },
    {
      "shortUrl": "http://short.ly/example2",
      "totalClicks": 150,
      "uniqueUsers": 100
    }
  ]
}

### Get Overall Analytics

**Endpoint**: /api/analytics/overall**Method**: GET

**Description**: Retrieve overall analytics for all short URLs created by the authenticated user.

**Response**:

```json
{
  "totalUrls": 10,
  "totalClicks": 500,
  "uniqueUsers": 300,
  "clicksByDate": [
    { "date": "2024-12-20", "clicks": 200 },
    { "date": "2024-12-21", "clicks": 300 }
  ],
  "osType": [
    { "osName": "Windows", "uniqueClicks": 200, "uniqueUsers": 120 },
    { "osName": "Android", "uniqueClicks": 300, "uniqueUsers": 180 }
  ],
  "deviceType": [
    { "deviceName": "mobile", "uniqueClicks": 400, "uniqueUsers": 250 },
    { "deviceName": "desktop", "uniqueClicks": 100, "uniqueUsers": 50 }
  ]
}


Rate Limiting
------------

Rate Limiting is added to prevent api abuse

Redis
------------

Redirect Api uses caching to store if a short url is previously fetched.