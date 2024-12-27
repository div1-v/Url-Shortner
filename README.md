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
    
6.  Contributing
    
7.  License
    

Installation
------------

Follow these steps to install and run the application locally:

1.  git clone https://github.com/your-username/url-shortener-api.gitcd url-shortener-api
    
2.  npm install
    
3.  PORT=3000MONGO\_URI=your\_mongodb\_connection\_stringGOOGLE\_CLIENT\_ID=your\_google\_client\_idGOOGLE\_CLIENT\_SECRET=your\_google\_client\_secretJWT\_SECRET=your\_jwt\_secret
    
4.  npm startThe server will start running at http://localhost:3000.
    

Usage
-----

Use a tool like Postman or cURL to interact with the API endpoints described below.

API Endpoints
-------------

### User Authentication

**Google Sign-In Authentication**:

*   Implement Google Sign-In for user authentication.
    
*   Once authenticated, the server generates a JWT for the user.
    

### Create Short URL

**Endpoint**: /api/shorten**Method**: POST

**Description**: Create a new short URL for easy sharing of long URLs.

**Request Body**:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "longUrl": "https://example.com",    "customAlias": "example",  // optional    "topic": "marketing"       // optional  }   `

**Response**:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "shortUrl": "http://short.ly/example",    "createdAt": "2024-12-27T12:00:00Z"  }   `

**Rate Limiting**: Limits the number of short URLs a user can create within a specific timeframe.

### Redirect Short URL

**Endpoint**: /api/shorten/{alias}**Method**: GET

**Description**: Redirect to the original URL based on the alias while tracking user engagement.

**Response**: Redirects the user to the original URL.

**Analytics Tracked**:

*   Timestamp
    
*   User agent
    
*   IP address
    
*   Geolocation
    

### Get URL Analytics

**Endpoint**: /api/analytics/{alias}**Method**: GET

**Description**: Retrieve detailed analytics for a specific short URL.

**Response**:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "totalClicks": 120,    "uniqueUsers": 80,    "clicksByDate": [      { "date": "2024-12-20", "clicks": 15 },      { "date": "2024-12-21", "clicks": 25 }    ],    "osType": [      { "osName": "Windows", "uniqueClicks": 60, "uniqueUsers": 40 },      { "osName": "Android", "uniqueClicks": 40, "uniqueUsers": 30 }    ],    "deviceType": [      { "deviceName": "mobile", "uniqueClicks": 70, "uniqueUsers": 50 },      { "deviceName": "desktop", "uniqueClicks": 50, "uniqueUsers": 30 }    ]  }   `

### Get Topic-Based Analytics

**Endpoint**: /api/analytics/topic/{topic}**Method**: GET

**Description**: Retrieve analytics for all short URLs grouped under a specific topic.

**Response**:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "totalClicks": 300,    "uniqueUsers": 200,    "clicksByDate": [      { "date": "2024-12-20", "clicks": 100 },      { "date": "2024-12-21", "clicks": 200 }    ],    "urls": [      {        "shortUrl": "http://short.ly/example1",        "totalClicks": 150,        "uniqueUsers": 100      },      {        "shortUrl": "http://short.ly/example2",        "totalClicks": 150,        "uniqueUsers": 100      }    ]  }   `

### Get Overall Analytics

**Endpoint**: /api/analytics/overall**Method**: GET

**Description**: Retrieve overall analytics for all short URLs created by the authenticated user.

**Response**:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "totalUrls": 10,    "totalClicks": 500,    "uniqueUsers": 300,    "clicksByDate": [      { "date": "2024-12-20", "clicks": 200 },      { "date": "2024-12-21", "clicks": 300 }    ],    "osType": [      { "osName": "Windows", "uniqueClicks": 200, "uniqueUsers": 120 },      { "osName": "Android", "uniqueClicks": 300, "uniqueUsers": 180 }    ],    "deviceType": [      { "deviceName": "mobile", "uniqueClicks": 400, "uniqueUsers": 250 },      { "deviceName": "desktop", "uniqueClicks": 100, "uniqueUsers": 50 }    ]  }   `

Rate Limiting
-------------

*   Implement rate limiting using middleware to restrict the number of requests users can make.
    
*   Configure the limits based on the API usage requirements.
    

Caching
-------

*   Implement caching for analytics endpoints to improve performance and reduce database load.
    
*   Use Redis for caching frequently requested analytics data.