# ![Zetta.js](http://i.imgur.com/09p3qw1.png)

Zetta is an open source platform for the Internet of Things, and this is the CLI interface for that platform.

At the moment it has some basic functionality. You can explore your Zetta API. You can list devices, peers, or run an experimental repl for a local zetta instance.

```bash

  Usage: undefined [options] [command]

  Commands:

    devices [options]
       Get devices for given zetta instance.

    peers
       List all peers on the current zetta server

    default <url>
       Set a default url to use.

    repl <script>
       Start a repl session inside Zetta.


  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    -u, --url <url>  Base url for zetta. Defaults to http://127.0.0.1:1337/

```

The repl functionality is experimental and requires and additonal module and configuration for use.
