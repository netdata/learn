

The Netdata web server is `static-threaded`, with a fixed, configurable number of threads. All the threads are
concurrently listening for web requests on the same sockets. The kernel distributes the incoming requests to them.

Each thread uses non-blocking I/O so it can serve any number of web requests in parallel.

This web server respects the `keep-alive` HTTP header to serve multiple HTTP requests via the same connection. 

If you're a Netdata user who wants to configure how the web server behaves, see the [web server reference
doc](/docs/agent/dashboards/reference-web-server).
