---
title: "Install Netdata with Docker"
date: 2020-04-23
custom_edit_url: https://github.com/netdata/netdata/edit/master/packaging/docker/README.md
---



Running the Netdata Agent in a container works best for an internal network or to quickly analyze a host. Docker helps
you get set up quickly, and doesn't install anything permanent on the system, which makes uninstalling the Agent easy.

See our full list of Docker images at [Docker Hub](https://hub.docker.com/r/netdata/netdata).

Starting with v1.12, Netdata collects anonymous usage information by default and sends it to Google Analytics. Read
about the information collected, and learn how to-opt, on our [anonymous statistics](/docs/agent/anonymous-statistics)
page.

The usage statistics are _vital_ for us, as we use them to discover bugs and priortize new features. We thank you for
_actively_ contributing to Netdata's future.

## Limitations running the Agent in Docker

For monitoring the whole host, running the Agent in a container can limit its capabilities. Some data, like the host OS
performance or status, is not accessible or not as detailed in a container as when running the Agent directly on the
host.

A way around this is to provide special mounts to the Docker container so that the Agent can get visibility on host OS
information like `/sys` and `/proc` folders or even `/etc/group` and shadow files.

Also, we now ship Docker images using an [ENTRYPOINT](https://docs.docker.com/engine/reference/builder/#entrypoint)
directive, not a COMMAND directive. Please adapt your execution scripts accordingly. You can find more information about
ENTRYPOINT vs COMMAND in the [Docker
documentation](https://docs.docker.com/engine/reference/builder/#understand-how-cmd-and-entrypoint-interact).

### Package scrambling in runtime (x86_64 only)

Our x86_64 Docker images use [Polymorphic Polyverse Linux package scrambling](https://polyverse.io/how-it-works/). For
increased security, you can enable rescrambling of Netdata packages during runtime by setting the environment variable
`RESCRAMBLE=true` while starting Netdata with a Docker container.

## Run the Agent with the Docker command

Quickly start a new Agent with the `docker run` command.

```bash
docker run -d --name=netdata \
  -p 19999:19999 \
  -v netdatalib:/var/lib/netdata \
  -v netdatacache:/var/cache/netdata \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/os-release:/host/etc/os-release:ro \
  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata
```

You can then access the dashboard at `http://localhost:19999`.

## Run the Agent with Docker Compose

The above can be converted to a `docker-compose.yml` file to use with [Docker
Compose](https://docs.docker.com/compose/):

```yaml
version: '3'
services:
  netdata:
    image: netdata/netdata
    container_name: netdata
    hostname: example.com # set to fqdn of host
    ports:
      - 19999:19999
    restart: unless-stopped
    cap_add:
      - SYS_PTRACE
    security_opt:
      - apparmor:unconfined
    volumes:
      - netdatalib:/var/lib/netdata
      - netdatacache:/var/cache/netdata
      - /etc/passwd:/host/etc/passwd:ro
      - /etc/group:/host/etc/group:ro
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /etc/os-release:/host/etc/os-release:ro

volumes:
  netdatalib:
  netdatacache:
```

Run `docker-compose up -d` in the same directory as the `docker-compose.yml` file to start the container.

## Configure Agent containers

You may need to configure the above `docker run...` and `docker-compose` commands based on your needs. You should
reference the [`docker run`](https://docs.docker.com/engine/reference/run/) and [Docker
Compose](https://docs.docker.com/compose/) documentation for details, but we'll cover a few recommended configurations
below, as well as those that are unique to Netdata Agent containers.

### Add or remove other volumes

Some of the volumes are optional depending on how you use Netdata:

-   If you don't want to use the apps.plugin functionality, you can remove the mounts of `/etc/passwd` and `/etc/group`
    (they are used to get proper user and group names for the monitored host) to get slightly better security.
-   Most modern linux distros supply `/etc/os-release` although some older distros only supply `/etc/lsb-release`. If
    this is the case you can change the line above that mounts the file inside the container to
    `-v /etc/lsb-release:/host/etc/lsb-release:ro`.
-   If your host is virtualized then Netdata cannot detect it from inside the container and will output the wrong
    metadata (e.g. on `/api/v1/info` queries). You can fix this by setting a variable that overrides the detection
    using, e.g. `--env VIRTUALIZATION=$(systemd-detect-virt -v)`. If you are using a `docker-compose.yml` then add:

```yaml
    environment:
      - VIRTUALIZATION=${VIRTUALIZATION}
```

This allows the information to be passed into `docker-compose` using:

```bash
VIRTUALIZATION=$(systemd-detect-virt -v) docker-compose up
```

### Docker container names resolution

There are a few options for resolving container names within Netdata. Some methods of doing so will allow root access to
your machine from within the container. Please read the following carefully.

#### Docker socket proxy (safest option)

Deploy a Docker socket proxy that accepts and filters out requests using something like
[HAProxy](/docs/agent/running-behind-haproxy/) so that it restricts connections to read-only access
to the CONTAINERS endpoint.

The reason it's safer to expose the socket to the proxy is because Netdata has a TCP port exposed outside the Docker
network. Access to the proxy container is limited to only within the network.

Below is [an example repository (and image)](https://github.com/Tecnativa/docker-socket-proxy) that provides a proxy to
the socket.

You run the Docker Socket Proxy in its own Docker Compose file and leave it on a private network that you can add to
other services that require access.

```yaml
version: '3'
services:
  netdata:
    image: netdata/netdata
    # ... rest of your config ...
    ports:
      - 19999:19999
    environment:
      - DOCKER_HOST=proxy:2375
  proxy:
    image: tecnativa/docker-socket-proxy
    volumes:
     - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - CONTAINERS=1

```
**Note:** Replace `2375` with the port of your proxy.

#### Giving group access to the Docker socket (less safe)

**Important Note**: You should seriously consider the necessity of activating this option, as it grants to the `netdata`
user access to the privileged socket connection of docker service and therefore your whole machine.

If you want to have your container names resolved by Netdata, make the `netdata` user be part of the group that owns the
socket.

To achieve that just add environment variable `PGID=[GROUP NUMBER]` to the Netdata container, where `[GROUP NUMBER]` is
practically the group id of the group assigned to the docker socket, on your host.

This group number can be found by running the following (if socket group ownership is docker):

```bash
grep docker /etc/group | cut -d ':' -f 3
```

#### Running as root (unsafe)

> You should seriously consider the necessity of activating this option, as it grants to the `netdata` user access to
> the privileged socket connection of docker service, and therefore your whole machine.

```yaml
version: '3'
services:
  netdata:
    image: netdata/netdata
    # ... rest of your config ...
    volumes:
      # ... other volumes ...
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - DOCKER_USR=root
```

### Pass command line options to Netdata

Since we use an [ENTRYPOINT](https://docs.docker.com/engine/reference/builder/#entrypoint) directive, you can provide
[Netdata daemon command line options](https://docs.netdata.cloud/daemon/#command-line-options) such as the IP address
Netdata will be running on, using the [command instruction](https://docs.docker.com/engine/reference/builder/#cmd). 

## Install the Agent using Docker Compose with SSL/TLS enabled HTTP Proxy

For a permanent installation on a public server, you should [secure the Netdata
instance](/docs/agent/netdata-security). This section contains an example of how to install Netdata with an SSL
reverse proxy and basic authentication.

You can use the following `docker-compose.yml` and Caddyfile files to run Netdata with Docker. Replace the domains and
email address for [Let's Encrypt](https://letsencrypt.org/) before starting.

### Caddyfile

This file needs to be placed in `/opt` with name `Caddyfile`. Here you customize your domain and you need to provide
your email address to obtain a Let's Encrypt certificate. Certificate renewal will happen automatically and will be
executed internally by the caddy server.

```caddyfile
netdata.example.org {
  proxy / netdata:19999
  tls admin@example.org
}
```

### docker-compose.yml

After setting Caddyfile run this with `docker-compose up -d` to have fully functioning Netdata setup behind HTTP reverse
proxy.

```yaml
version: '3'
volumes:
  caddy:

services:
  caddy:
    image: abiosoft/caddy
    ports:
      - 80:80
      - 443:443
    volumes:
      - /opt/Caddyfile:/etc/Caddyfile
      - $HOME/.caddy:/root/.caddy
    environment:
      ACME_AGREE: 'true'
  netdata:
    restart: always
    hostname: netdata.example.org
    image: netdata/netdata
    cap_add:
      - SYS_PTRACE
    security_opt:
      - apparmor:unconfined
    volumes:
      - /etc/passwd:/host/etc/passwd:ro
      - /etc/group:/host/etc/group:ro
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

### Restrict access with basic auth

You can restrict access by following [official caddy guide](https://caddyserver.com/docs/basicauth) and adding lines to
Caddyfile.

## Publish a test image to your own repository

At Netdata, we provide multiple ways of testing your Docker images using your own repositories.
You may either use the command line tools available or take advantage of our Travis CI infrastructure.

### Inside Netdata organization, using Travis CI

To enable Travis CI integration on your own repositories (Docker and Github), you need to be part of the Netdata
organization.

Once you have contacted the Netdata owners to setup you up on Github and Travis, execute the following steps

-   Preparation
    -   Have Netdata forked on your personal GitHub account
    -   Get a GitHub token: Go to **GitHub settings** -> **Developer Settings** -> **Personal access tokens**, and
        generate a new token with full access to `repo_hook`, read-only access to `admin:org`, `public_repo`,
        `repo_deployment`, `repo:status`, and `user:email` settings enabled. This will be your `GITHUB_TOKEN` that is
        described later in the instructions, so keep it somewhere safe.
    -   Contact the Netdata team and seek for permissions on `https://scan.coverity.com` should you require Travis to be
        able to push your forked code to coverity for analysis and report. Once you are setup, you should have your
        email you used in coverity and a token from them. These will be your `COVERITY_SCAN_SUBMIT_EMAIL` and
        `COVERITY_SCAN_TOKEN` that we will refer to later.
    -   Have a valid Docker hub account, the credentials from this account will be your `DOCKER_USERNAME` and
        `DOCKER_PWD` mentioned later.

-   Setting up Travis CI for your own fork (Detailed instructions provided by Travis team [here](https://docs.travis-ci.com/user/tutorial/))
    -   Login to travis with your own GITHUB credentials (There is Open Auth access)
    -   Go to your profile settings, under [repositories](https://travis-ci.com/account/repositories) section and setup
        your Netdata fork to be built by Travis CI.
    -   Once the repository has been setup, go to repository settings within Travis CI (usually under
        `https://travis-ci.com/NETDATA_DEVELOPER/netdata/settings`, where `NETDATA_DEVELOPER` is your GitHub handle),
        and select your desired settings.

-   While in Travis settings, under Netdata repository settings in the Environment Variables section, you need to add
    the following:
    -   `DOCKER_USERNAME` and `DOCKER_PWD` variables so that Travis can login to your Docker Hub account and publish
        Docker images there. 
    -   `REPOSITORY` variable to `NETDATA_DEVELOPER/netdata`, where `NETDATA_DEVELOPER` is your GitHub handle again.
    -   `GITHUB_TOKEN` variable with the token generated on the preparation step, for Travis workflows to function
        properly.
    -   `COVERITY_SCAN_SUBMIT_EMAIL` and `COVERITY_SCAN_TOKEN` variables to enable Travis to submit your code for
        analysis to Coverity.

Having followed these instructions, your forked repository should be all set up for integration with Travis CI. Happy
testing!


