---
title: "Install Netdata on Alpine 3.x"
custom_edit_url: https://github.com/netdata/netdata/edit/master/packaging/installer/methods/alpine.md
---



Execute these commands to install Netdata in Alpine Linux 3.x:

```sh
# install required packages
apk add alpine-sdk bash curl libuv-dev zlib-dev util-linux-dev libmnl-dev gcc make git autoconf automake pkgconfig python3 logrotate

# if you plan to run node.js Netdata plugins
apk add nodejs

# download Netdata - the directory 'netdata' will be created
git clone https://github.com/netdata/netdata.git --depth=100 --recursive
cd netdata

# build it, install it, start it
./netdata-installer.sh

# make Netdata start at boot and stop at shutdown
cat > /etc/init.d/netdata << EOF
#!/sbin/openrc-run

name="netdata"
command="/usr/sbin/$SVCNAME"

depend() {
        need net localmount
        after firewall
}
EOF
```

If you have installed Netdata in another directory, you have to change the content of the `command` variable in that script.


