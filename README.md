## Drone.io Convert Pipeline

This [Drone.io](https://drone.io) conversion extension plugin allows for pipelining multiple conversion extensions together

### Running

This plugin is available via [Github's packages](https://github.com/goodwillaz/drone-convert-pipeline/packages) or you can optionally build and host yourself.

```bash
$ docker build --rm -t <your-repo>/drone-convert-pipeline:latest .
$ drone push <your-registry>/drone-convert-pipeline:latest
```

### Usage

#### Docker Compose

(Necessary config portion shown only)

```yaml
services:
  drone-server:
    ...
    environment:
      - DRONE_CONVERT_PLUGIN_ENDPOINT=http://drone-convert-pipeline:3000
      - DRONE_YAML_SECRET=${CONVERT_SECRET:?CONVERT_SECRET is required}
      ...
    depends_on:
      - drone-convert-pipeline
      ...
  
  drone-convert-pipeline:
    image: ghcr.io/goodwillaz/drone-convert-pipeline:latest
    environment:
      - PLUGIN_SECRET=${CONVERT_SECRET:?CONVERT_SECRET is required}
      - PLUGIN_ENDPOINTS=http://drone-convert-plugin-slack:3000,http://another-plugin:3000
```

### Environment Variable Support

Here's a full list of environment variables supported by the plugin:

* PLUGIN_SECRET (required)
* PLUGIN_ENDPOINTS (required)
* PLUGIN_HOST (default: 0.0.0.0)
* PLUGIN_PORT (default: 3000)
* PLUGIN_DEBUG - (default: false)

### License

See the [LICENSE](LICENSE.md) file for license rights and limitations (BSD 3-clause).
