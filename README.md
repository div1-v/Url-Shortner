URL Shortener & Analytics API
=============================

This Node.js application provides a service for shortening URLs, tracking clicks, and generating detailed analytics for each short URL. 

## Features

- Google OAuth login
- Shorten any Long url
- Access Short Url anywhere
- Get Analytics of a Particular url
- Get Analytics by topic
- Get overall Analytics
- Redis for caching url details


## Installation

Clone Github repository

```bash
  https://github.com/div1-v/Url-Shortner.git
  cd Url-Shortner
```

Install dependencies

```bash
  npm i
``` 


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`REDIS_USERNAME`

`REDIS_PASS`

`REDIS_HOST`

`REDIS_PORT`

`GOOGLE_CLIENT_ID`

`GOOGLE_CLIENT_SECRET`

`JWT_SECRET`

`MONGO_URI`

`BASE_URL`

`ANOTHER_API_KEY`

### Start Server

```bash
  npm start
``` 


## API Reference

## Google Login/Register

```http
  Get /api/auth/google/register
```

```bash
This api will redirect you to google login page. After successful login
you will get access token which needs to be passed to other apis in headers.
```

## Shorten Long Urls

```http
  POST /api/shorten
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `longUrl` | `string` | **Required**. url to be shorted |
| `customAlas` | `string` | **Optional**. alias for short url |
| `topic` | `string` | **Optional**. topic for grouping urls |

### Response
```bash
{
  "shortUrl": "http://short.ly/example",
  "createdAt": "2024-12-27T12:00:00Z"
}
``` 


## Redirect Url

```http
  GET /api/shorten/${alias}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |

### Response
```bash
{
  "shortUrl": "http://short.ly/example",
  "createdAt": "2024-12-27T12:00:00Z"
}
``` 

#### Analytics By Alias

```http
  POST /api/analytics/${alias}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |

### Response
```bash
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
``` 

#### Analytics By Topic

```http
  POST /api/analytics/topic/${topic}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |

```bash
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
```

#### Overall Analytics 

```http
  POST /api/analytics/overall
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |

```bash
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
```

## Swagger Docs

```http
  Get /docs
```

```bash
To checkout swagger docs
```

## Deployment

Add your docker hub username and access token in github secrets and variable.
Github action will create a docker image on every push to this branch and push 
image to your docker hub.
you can use that image url to deploy.

## Test

To run tests, go to test/tests.js file, There add a bearer token as a global variable to access apis.

```bash
  npm run test
```

