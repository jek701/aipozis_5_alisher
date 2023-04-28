# HTTP Server and Client

This project is a simple HTTP server and client implementation using Node.js. The server can serve files from a specified directory and handle GET, POST, and OPTIONS requests. The client can make HTTP requests with custom headers and request bodies.

### How to start the project

Install Node.js if you haven't already. <br />
Make sure to install the commander library by running npm init to create a package.json file and then npm install commander. <br />
Run the server using the command: node server.js. The server will start and listen on the specified address and port (default is localhost:8080). <br />

```bash
node server.js
```

## How to send commands?

You can use command-line tools like curl or GUI-based tools like Postman or Insomnia to send HTTP requests to your server.

### Using curl
Replace <request-method> with the desired HTTP method (GET, POST, OPTIONS), <request-url> with the target URL, and <header-name>: <header-value> with any custom headers:

```bash
curl -X <request-method> -H "<header-name>: <header-value>" <request-url>
```

Here are two examples for each request method (GET, POST, OPTIONS) using the curl command-line tool.

#### GET requests
Example 1: Fetch index.html from the server:

```bash
curl http://localhost:8080/index.html
```
Example 2: Fetch an image file (e.g., image.png) from the server:

```bash
curl -O http://localhost:8080/image.png
```
The -O flag is used to save the response body in a file with the same name as the remote file.

#### POST requests
Example 1: Create a new file named new-file.txt with the content of data.txt:

```bash
curl -X POST -d @data.txt http://localhost:8080/new-file.txt
```
Replace data.txt with the path to your test file.

Example 2: Update the content of an existing file named existing-file.txt with the content of update-data.txt:

```bash
curl -X POST -d @update-data.txt http://localhost:8080/existing-file.txt
```
Replace update-data.txt with the path to your test file.

#### OPTIONS requests
Example 1: Rename an existing file named old-filename-1.txt to new-filename-1.txt:

```bash
curl -X OPTIONS -H "X-New-File-Name: new-filename-1.txt" http://localhost:8080/old-filename-1.txt
```
Example 2: Rename an existing file named old-filename-2.txt to new-filename-2.txt:

```bash
curl -X OPTIONS -H "X-New-File-Name: new-filename-2.txt" http://localhost:8080/old-filename-2.txt
```
Remember to include the X-New-File-Name header with the new file name for OPTIONS requests.